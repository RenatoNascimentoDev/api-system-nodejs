import { CreateQuestionUseCase } from '../domain/use-cases/create-question.ts'
import { UploadAudioUseCase } from '../domain/use-cases/upload-audio.ts'
import { CreateRoomUseCase } from '../domain/use-cases/create-room.ts'
import { CreateUserUseCase } from '../domain/use-cases/create-user.ts'
import { CreateSessionUseCase } from '../domain/use-cases/create-session.ts'
import { ChangePasswordUseCase } from '../domain/use-cases/change-password.ts'
import { DrizzleRoomsRepository } from '../infra/repositories/drizzle-rooms-repository.ts'
import { DrizzleAiUsageRepository } from '../infra/repositories/drizzle-ai-usage-repository.ts'
import { DrizzleAudioChunksRepository } from '../infra/repositories/drizzle-audio-chunks-repository.ts'
import { DrizzleQuestionsRepository } from '../infra/repositories/drizzle-questions-repository.ts'
import { OpenAiAiService } from '../infra/services/openai-ai-service.ts'
import { DrizzleUsersRepository } from '../infra/repositories/drizzle-users-repository.ts'
import { BcryptPasswordHasher } from '../infra/security/bcrypt-password-hasher.ts'

const roomsRepository = new DrizzleRoomsRepository()
const aiUsageRepository = new DrizzleAiUsageRepository()
const audioChunksRepository = new DrizzleAudioChunksRepository()
const questionsRepository = new DrizzleQuestionsRepository()
const usersRepository = new DrizzleUsersRepository()
const passwordHasher = new BcryptPasswordHasher()
const aiService = new OpenAiAiService()

export const useCases = {
  createQuestion: new CreateQuestionUseCase(
    roomsRepository,
    aiUsageRepository,
    audioChunksRepository,
    questionsRepository,
    aiService
  ),
  uploadAudio: new UploadAudioUseCase(roomsRepository, audioChunksRepository, aiService),
  createRoom: new CreateRoomUseCase(usersRepository, roomsRepository),
  createUser: new CreateUserUseCase(usersRepository, passwordHasher),
  createSession: new CreateSessionUseCase(usersRepository, passwordHasher),
  changePassword: new ChangePasswordUseCase(usersRepository, passwordHasher),
}
