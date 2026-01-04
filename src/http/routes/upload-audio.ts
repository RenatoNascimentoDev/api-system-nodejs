import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { uploadAudioController } from '../controllers/upload-audio-controller.ts'
import { authenticate } from '../middleware/authenticate.ts'

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
    uploadAudioController
  )
}
