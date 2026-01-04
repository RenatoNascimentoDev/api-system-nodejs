import { FastifyRequest } from 'fastify'
import { count, eq } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export async function getRoomsController(_: FastifyRequest) {
  const results = await db
    .select({
      id: schema.rooms.id,
      name: schema.rooms.name,
      createdAt: schema.rooms.createdAt,
      questionsCount: count(schema.questions.id),
    })
    .from(schema.rooms)
    .leftJoin(schema.questions, eq(schema.questions.roomId, schema.rooms.id))
    .groupBy(schema.rooms.id)
    .orderBy(schema.rooms.createdAt)

  return results
}
