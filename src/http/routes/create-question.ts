import { and, eq, sql } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { authenticate } from '../middleware/authenticate.ts'
import { generateAnswer, generateEmbeddings } from '../../services/openai.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },

    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body
      const userId = request.user.sub

      const roomOwner = await db
        .select({ userId: schema.rooms.userId })
        .from(schema.rooms)
        .where(eq(schema.rooms.id, roomId))
        .limit(1)

      const room = roomOwner[0]
      if (!room) return reply.status(404).send({ message: 'Sala não encontrada' })
      if (room.userId !== userId) return reply.status(403).send({ message: 'Sem permissão para essa sala' })

      const today = new Date()
      const usage = await db
        .select({ questionCount: schema.aiUsage.questionCount })
        .from(schema.aiUsage)
        .where(
          and(
          eq(schema.aiUsage.userId, userId),
          eq(schema.aiUsage.roomId, roomId),
          eq(schema.aiUsage.date, today)
        )
      )
      .limit(1)

      if(usage[0]?.questionCount >= 10) {
        return reply.status(429).send({ message: 'Limite diário de perguntas atingido' })
      }

      const usageUpdate = await db 
        .insert(schema.aiUsage)
        .values({ userId, roomId, date: today, questionCount: 1 })
        .onConflictDoUpdate({
          target: [schema.aiUsage.userId, schema.aiUsage.roomId, schema.aiUsage.date],
          set: { questionCount: sql`${schema.aiUsage.questionCount} + 1` },
        })
        .returning({ questionCount: schema.aiUsage.questionCount })

      if ((usageUpdate[0]?.questionCount ?? 1) > 10) {
        return reply.status(429).send({ message: 'Limite diário de perguntas atingido' })
      }

      const embeddings = await generateEmbeddings(question)

      const vectorLiteral = sql`${`[${embeddings.join(',')}]`}::vector`

      const chunks = await db
        .select({
          id: schema.audiosChunks.id,
          transcription: schema.audiosChunks.transcription,
          similarity: sql<number>`1 - (${schema.audiosChunks.embeddings} <=> ${vectorLiteral})`,
        })
        .from(schema.audiosChunks)
        .where(
          and(
            eq(schema.audiosChunks.roomId, roomId),
            sql`1 - (${schema.audiosChunks.embeddings} <=> ${vectorLiteral}) > 0.7`
          )
        )
        .orderBy(
          sql`${schema.audiosChunks.embeddings} <=> ${vectorLiteral}`
        )
        .limit(3)

      let answer: string | null = null

      if (chunks.length > 0) {
        const transcriptions = chunks.map(chunk => chunk.transcription)

        answer = await generateAnswer(question, transcriptions)
      }

      const result = await db
        .insert(schema.questions)
        .values({ roomId, question, answer, userId })
        .returning()

      const insertQuestion = result[0]

      if (!insertQuestion) {
        throw new Error('Failed to create new question.')
      }

      return reply.status(201).send({
        questionId: insertQuestion.id,
        answer,
      })
    }
  )
}
