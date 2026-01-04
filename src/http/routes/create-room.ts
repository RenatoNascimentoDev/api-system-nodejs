import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createRoomController } from '../controllers/create-room-controller.ts'
import { authenticate } from '../middleware/authenticate.ts'

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
    createRoomController
  )
}
