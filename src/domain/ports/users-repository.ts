export interface UserRecord {
  id: string
  name: string
  email: string
  passwordHash: string
  avatarUrl: string | null
  totalRoomsCreated: number
}

export interface UsersRepository {
  findById(userId: string): Promise<UserRecord | null>
  findByEmail(email: string): Promise<UserRecord | null>
  create(data: { name: string; email: string; passwordHash: string }): Promise<{ id: string }>
  incrementTotalRoomsCreated(userId: string): Promise<void>
  updatePassword(userId: string, passwordHash: string): Promise<void>
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<void>
}
