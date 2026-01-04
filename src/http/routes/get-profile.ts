import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { authenticate } from '../middleware/authenticate.ts'
import { getProfileController } from '../controllers/get-profile-controller.ts'

export const getProfileRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/me',
    {
      preHandler: [authenticate],
    },
    getProfileController
  )
}
