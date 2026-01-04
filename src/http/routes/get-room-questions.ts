import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { getRoomQuestionsController } from '../controllers/get-room-questions-controller.ts'

export const getRoomsQuestions: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/questions', 
    {
    schema: {
      params: z.object({
        roomId: z.string(),
      }),
    },
  }, 
  getRoomQuestionsController
  )
}
