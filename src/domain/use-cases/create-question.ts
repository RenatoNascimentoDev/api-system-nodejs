import type { AIService } from '../ports/ai-service.ts'
import type { AiUsageRepository } from '../ports/ai-usage-repository.ts'
import type { AudioChunksRepository } from '../ports/audio-chunks-repository.ts'
import type { QuestionsRepository } from '../ports/questions-repository.ts'
import type { RoomsRepository } from '../ports/rooms-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type CreateQuestionInput = {
  roomId: string
  question: string
  userId: string
}

type CreateQuestionSuccess = {
  questionId: string
  answer: string | null
}

type CreateQuestionError =
  | 'ROOM_NOT_FOUND'
  | 'FORBIDDEN'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'CREATE_FAILED'

export class CreateQuestionUseCase {
  private readonly roomsRepository: RoomsRepository
  private readonly aiUsageRepository: AiUsageRepository
  private readonly audioChunksRepository: AudioChunksRepository
  private readonly questionsRepository: QuestionsRepository
  private readonly aiService: AIService

  constructor(
    roomsRepository: RoomsRepository,
    aiUsageRepository: AiUsageRepository,
    audioChunksRepository: AudioChunksRepository,
    questionsRepository: QuestionsRepository,
    aiService: AIService
  ) {
    this.roomsRepository = roomsRepository
    this.aiUsageRepository = aiUsageRepository
    this.audioChunksRepository = audioChunksRepository
    this.questionsRepository = questionsRepository
    this.aiService = aiService
  }

  async execute(input: CreateQuestionInput): Promise<Result<CreateQuestionSuccess, CreateQuestionError>> {
    const { roomId, question, userId } = input

    const roomRecord = await this.roomsRepository.findById(roomId)

    if (!roomRecord) {
      return failure('ROOM_NOT_FOUND')
    }

    if (roomRecord.userId !== userId) {
      return failure('FORBIDDEN')
    }

    const today = new Date()
    const existingUsage = await this.aiUsageRepository.getDailyUsageCount({ userId, roomId, date: today })

    if (existingUsage >= 10) {
      return failure('DAILY_LIMIT_EXCEEDED')
    }

    const updatedUsage = await this.aiUsageRepository.incrementDailyUsage({ userId, roomId, date: today })

    if (updatedUsage > 10) {
      return failure('DAILY_LIMIT_EXCEEDED')
    }

    const embeddings = await this.aiService.generateEmbeddings(question)

    const relevantChunks = await this.audioChunksRepository.findRelevant({
      roomId,
      embeddings,
      minScore: 0.7,
      limit: 3,
    })

    const transcriptions = relevantChunks.map((chunk) => chunk.transcription)

    let answer: string | null = null

    if (transcriptions.length > 0) {
      answer = await this.aiService.generateAnswer(question, transcriptions)
    }

    const createdQuestion = await this.questionsRepository.create({
      roomId,
      question,
      answer,
      userId,
    })

    if (!createdQuestion?.id) {
      return failure('CREATE_FAILED')
    }

    return success({ questionId: createdQuestion.id, answer })
  }
}
