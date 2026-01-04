import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createSessionController } from '../controllers/create-session-controller.ts'

export const createSessionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/sessions',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    createSessionController
  )
}
