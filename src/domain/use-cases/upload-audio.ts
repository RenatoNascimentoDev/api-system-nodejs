import type { AIService } from '../ports/ai-service.ts'
import type { AudioChunksRepository } from '../ports/audio-chunks-repository.ts'
import type { RoomsRepository } from '../ports/rooms-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type UploadAudioInput = {
  roomId: string
  userId: string
  audioBase64: string
  mimeType: string
}

type UploadAudioSuccess = {
  chunkId: string
}

type UploadAudioError =
  | 'ROOM_NOT_FOUND'
  | 'FORBIDDEN'
  | 'ROOM_AUDIO_LIMIT'
  | 'AUDIO_TOO_LONG'
  | 'SAVE_FAILED'

export class UploadAudioUseCase {
  private readonly roomsRepository: RoomsRepository
  private readonly audioChunksRepository: AudioChunksRepository
  private readonly aiService: AIService

  constructor(
    roomsRepository: RoomsRepository,
    audioChunksRepository: AudioChunksRepository,
    aiService: AIService
  ) {
    this.roomsRepository = roomsRepository
    this.audioChunksRepository = audioChunksRepository
    this.aiService = aiService
  }

  async execute(input: UploadAudioInput): Promise<Result<UploadAudioSuccess, UploadAudioError>> {
    const { roomId, userId, audioBase64, mimeType } = input

    const roomRecord = await this.roomsRepository.findById(roomId)

    if (!roomRecord) {
      return failure('ROOM_NOT_FOUND')
    }

    if (roomRecord.userId !== userId) {
      return failure('FORBIDDEN')
    }

    if (roomRecord.audioUploads >= 3) {
      return failure('ROOM_AUDIO_LIMIT')
    }

    const transcriptionResponse = await this.aiService.transcribeAudio(audioBase64, mimeType)
    const { text: transcription, durationSeconds } = transcriptionResponse

    if (durationSeconds > 60) {
      return failure('AUDIO_TOO_LONG')
    }

    const embeddings = await this.aiService.generateEmbeddings(transcription)

    const createdChunk = await this.audioChunksRepository.create({
      roomId,
      transcription,
      embeddings,
      durationSeconds,
    })

    if (!createdChunk?.id) {
      return failure('SAVE_FAILED')
    }

    await this.roomsRepository.incrementAudioUploads(roomId)

    return success({ chunkId: createdChunk.id })
  }
}
