import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { authenticate } from '../middleware/authenticate.ts'
import { uploadAvatarController } from '../controllers/upload-avatar-controller.ts'

export const uploadAvatarRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/users/avatar',
    {
      preHandler: [authenticate],
    },
    uploadAvatarController
  )
}
