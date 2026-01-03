import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { transcribeAudio, generateEmbeddings } from '../../services/openai.ts'
import { authenticate } from '../middleware/authenticate.ts'
import { eq, sql } from 'drizzle-orm'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const userId = request.user.sub
      const audio = await request.file()

      if (!audio) throw new Error('Audio is required.')

      const roomOwner = await db
        .select({ userId: schema.rooms.userId, audioUploads: schema.rooms.audioUploads })
        .from(schema.rooms)
        .where(eq(schema.rooms.id, roomId))
        .limit(1)

      const room = roomOwner[0]
      if (!room) return reply.status(404).send({ message: 'Sala não encontrada' })
      if (room.userId !== userId) return reply.status(403).send({ message: 'Sem permissão para esta sala' })
      if (room.audioUploads >= 3) return reply.status(429).send({ message: 'Limite de áudios da sala atingido' })

      const audioBuffer = await audio.toBuffer()
      const audioAsBase64 = audioBuffer.toString('base64')

      const transcriptionResponse = await transcribeAudio(audioAsBase64, audio.mimetype)
      const { text, durationSeconds } = transcriptionResponse

      if (durationSeconds > 60) {
        return reply.status(400).send({ message: 'Áudio excede 60 segundos' })
      }

      const embeddings = await generateEmbeddings(text)

      const result = await db
        .insert(schema.audiosChunks)
        .values({
          roomId,
          transcription: text,
          embeddings,
          durationSeconds,
        })
        .returning()

      const chunk = result[0]
      if (!chunk) throw new Error('Erro ao salvar chunk de áudio.')

      await db
        .update(schema.rooms)
        .set({ audioUploads: sql`${schema.rooms.audioUploads} + 1` })
        .where(eq(schema.rooms.id, roomId))

      return reply.status(201).send({ chunkId: chunk.id })
    }
  )
}
