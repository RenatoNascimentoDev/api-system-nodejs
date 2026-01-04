import { compare, hash } from 'bcryptjs'
import type { PasswordHasher } from '../../domain/ports/password-hasher.ts'

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, 10)
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(plainPassword, hashedPassword)
  }
}
