import type { PasswordHasher } from '../ports/password-hasher.ts'
import type { UsersRepository } from '../ports/users-repository.ts'
import type { Result } from '../shared/result.ts'
import { success, failure } from '../shared/result.ts'

type ChangePasswordInput = {
  userId: string
  currentPassword: string
  newPassword: string
}

type ChangePasswordSuccess = {
  message: string
}

type ChangePasswordError = 'USER_NOT_FOUND' | 'INVALID_CURRENT_PASSWORD'

export class ChangePasswordUseCase {
  private readonly usersRepository: UsersRepository
  private readonly passwordHasher: PasswordHasher

  constructor(usersRepository: UsersRepository, passwordHasher: PasswordHasher) {
    this.usersRepository = usersRepository
    this.passwordHasher = passwordHasher
  }

  async execute(input: ChangePasswordInput): Promise<Result<ChangePasswordSuccess, ChangePasswordError>> {
    const { userId, currentPassword, newPassword } = input

    const userRecord = await this.usersRepository.findById(userId)

    if (!userRecord) {
      return failure('USER_NOT_FOUND')
    }

    const isCurrentPasswordValid = await this.passwordHasher.compare(currentPassword, userRecord.passwordHash)

    if (!isCurrentPasswordValid) {
      return failure('INVALID_CURRENT_PASSWORD')
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword)

    await this.usersRepository.updatePassword(userId, newPasswordHash)

    return success({ message: 'Senha atualizada com sucesso' })
  }
}
