import { eq, sql as rawSql } from 'drizzle-orm'
import { db as database } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import type { UserRecord, UsersRepository } from '../../domain/ports/users-repository.ts'

export class DrizzleUsersRepository implements UsersRepository {
  async findById(userId: string): Promise<UserRecord | null> {
    const records = await database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        passwordHash: schema.users.passwordHash,
        avatarUrl: schema.users.avatarUrl,
        totalRoomsCreated: schema.users.totalRoomsCreated,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)

    return records[0] ?? null
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const records = await database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        passwordHash: schema.users.passwordHash,
        avatarUrl: schema.users.avatarUrl,
        totalRoomsCreated: schema.users.totalRoomsCreated,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    return records[0] ?? null
  }

  async create(data: { name: string; email: string; passwordHash: string }): Promise<{ id: string }> {
    const { name, email, passwordHash } = data

    const records = await database
      .insert(schema.users)
      .values({ name, email, passwordHash })
      .returning({ id: schema.users.id })

    const createdRecord = records[0]

    if (!createdRecord?.id) {
      throw new Error('Failed to create user')
    }

    return { id: createdRecord.id }
  }

  async incrementTotalRoomsCreated(userId: string): Promise<void> {
    await database
      .update(schema.users)
      .set({ totalRoomsCreated: rawSql`${schema.users.totalRoomsCreated} + 1` })
      .where(eq(schema.users.id, userId))
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await database
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, userId))
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    await database
      .update(schema.users)
      .set({ avatarUrl })
      .where(eq(schema.users.id, userId))
  }
}
