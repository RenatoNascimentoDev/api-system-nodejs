import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { authenticate } from '../middleware/authenticate.ts'
import { eq, sql } from 'drizzle-orm'

export const createRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms',
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body
      const userId = request.user.sub

      const user = await db
        .select({ totalRoomsCreated: schema.users.totalRoomsCreated })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1)

      const totalRoomsCreated = user[0]?.totalRoomsCreated ?? 0
      if (totalRoomsCreated >= 3) {
        return reply.status(429).send({ message: 'Limite de salas atingido' })
      }

      const result = await db
        .insert(schema.rooms)
        .values({ name, description, userId })
        .returning()

      const insertedRoom = result[0]
      if (!insertedRoom) {
        throw new Error('Failed to create new room.')
      }

      await db
        .update(schema.users)
        .set({ totalRoomsCreated: sql`${schema.users.totalRoomsCreated} + 1` })
        .where(eq(schema.users.id, userId))

      return reply.status(201).send({ roomId: insertedRoom.id })
    }
  )
}
