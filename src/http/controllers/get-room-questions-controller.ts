import { FastifyReply, FastifyRequest } from 'fastify'
import { desc, eq } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export async function getRoomQuestionsController(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const { roomId } = request.params as { roomId: string }

  const result = await db
    .select({
      id: schema.questions.id,
      question: schema.questions.question,
      answer: schema.questions.answer,
      createdAt: schema.questions.createdAt,
    })
    .from(schema.questions)
    .where(eq(schema.questions.roomId, roomId))
    .orderBy(desc(schema.questions.createdAt))

  return result
}
