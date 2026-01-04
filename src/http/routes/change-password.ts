import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { changePasswordController } from '../controllers/change-password-controller.ts'
import { authenticate } from '../middleware/authenticate.ts'

const passwordSchema = z
  .string()
  .min(10)
  .max(15)
  .regex(/[A-Z]/)
  .regex(/\d/)
  .regex(/[^A-Za-z0-9]/)

export const changePasswordRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/users/password',
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          currentPassword: z.string().min(1),
          newPassword: passwordSchema,
        }),
      },
    },
    changePasswordController
  )
}
