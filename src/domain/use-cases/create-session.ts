import type { PasswordHasher } from '../ports/password-hasher.ts'
import type { UsersRepository } from '../ports/users-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type CreateSessionInput = {
  email: string
  password: string
}

type CreateSessionSuccess = {
  userId: string
  name: string
  email: string
}

type CreateSessionError = 'INVALID_CREDENTIALS'

export class CreateSessionUseCase {
  private readonly usersRepository: UsersRepository
  private readonly passwordHasher: PasswordHasher

  constructor(usersRepository: UsersRepository, passwordHasher: PasswordHasher) {
    this.usersRepository = usersRepository
    this.passwordHasher = passwordHasher
  }

  async execute(input: CreateSessionInput): Promise<Result<CreateSessionSuccess, CreateSessionError>> {
    const { email, password } = input

    const userRecord = await this.usersRepository.findByEmail(email)

    if (!userRecord) {
      return failure('INVALID_CREDENTIALS')
    }

    const isPasswordValid = await this.passwordHasher.compare(password, userRecord.passwordHash)

    if (!isPasswordValid) {
      return failure('INVALID_CREDENTIALS')
    }

    return success({
      userId: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
    })
  }
}
