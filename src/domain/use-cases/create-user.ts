import type { PasswordHasher } from '../ports/password-hasher.ts'
import type { UsersRepository } from '../ports/users-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type CreateUserInput = {
  name: string
  email: string
  password: string
}

type CreateUserSuccess = {
  userId: string
}

type CreateUserError = 'EMAIL_ALREADY_EXISTS' | 'CREATE_FAILED'

export class CreateUserUseCase {
  private readonly usersRepository: UsersRepository
  private readonly passwordHasher: PasswordHasher

  constructor(usersRepository: UsersRepository, passwordHasher: PasswordHasher) {
    this.usersRepository = usersRepository
    this.passwordHasher = passwordHasher
  }

  async execute(input: CreateUserInput): Promise<Result<CreateUserSuccess, CreateUserError>> {
    const { name, email, password } = input

    const existingUser = await this.usersRepository.findByEmail(email)

    if (existingUser) {
      return failure('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await this.passwordHasher.hash(password)

    const createdUser = await this.usersRepository.create({ name, email, passwordHash })

    if (!createdUser?.id) {
      return failure('CREATE_FAILED')
    }

    return success({ userId: createdUser.id })
  }
}
