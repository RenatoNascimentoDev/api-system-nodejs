import type { RoomsRepository } from '../ports/rooms-repository.ts'
import type { UsersRepository } from '../ports/users-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type CreateRoomInput = {
  userId: string
  name: string
  description?: string | null
}

type CreateRoomSuccess = {
  roomId: string
}

type CreateRoomError = 'USER_NOT_FOUND' | 'ROOM_LIMIT_REACHED' | 'CREATE_FAILED'

export class CreateRoomUseCase {
  private readonly usersRepository: UsersRepository
  private readonly roomsRepository: RoomsRepository

  constructor(usersRepository: UsersRepository, roomsRepository: RoomsRepository) {
    this.usersRepository = usersRepository
    this.roomsRepository = roomsRepository
  }

  async execute(input: CreateRoomInput): Promise<Result<CreateRoomSuccess, CreateRoomError>> {
    const { userId, name, description } = input

    const userRecord = await this.usersRepository.findById(userId)

    if (!userRecord) {
      return failure('USER_NOT_FOUND')
    }

    if (userRecord.totalRoomsCreated >= 3) {
      return failure('ROOM_LIMIT_REACHED')
    }

    const createdRoom = await this.roomsRepository.create({
      name,
      description,
      userId,
    })

    if (!createdRoom?.id) {
      return failure('CREATE_FAILED')
    }

    await this.usersRepository.incrementTotalRoomsCreated(userId)

    return success({ roomId: createdRoom.id })
  }
}
