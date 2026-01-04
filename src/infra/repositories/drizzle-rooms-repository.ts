import { eq, sql as rawSql } from 'drizzle-orm'
import { db as database } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import type { RoomRecord, RoomsRepository } from '../../domain/ports/rooms-repository.ts'

export class DrizzleRoomsRepository implements RoomsRepository {
  async findById(roomId: string): Promise<RoomRecord | null> {
    const records = await database
      .select({
        id: schema.rooms.id,
        userId: schema.rooms.userId,
        audioUploads: schema.rooms.audioUploads,
      })
      .from(schema.rooms)
      .where(eq(schema.rooms.id, roomId))
      .limit(1)

    return records[0] ?? null
  }

  async create(data: { name: string; description?: string | null; userId: string }): Promise<{ id: string }> {
    const { name, description, userId } = data

    const records = await database
      .insert(schema.rooms)
      .values({ name, description, userId })
      .returning({ id: schema.rooms.id })

    const createdRecord = records[0]

    if (!createdRecord?.id) {
      throw new Error('Failed to create room')
    }

    return { id: createdRecord.id }
  }

  async incrementAudioUploads(roomId: string): Promise<void> {
    await database
      .update(schema.rooms)
      .set({ audioUploads: rawSql`${schema.rooms.audioUploads} + 1` })
      .where(eq(schema.rooms.id, roomId))
  }
}
