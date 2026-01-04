import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { useCases } from '../../config/container.ts'
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
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body
      const userId = request.user.sub

      const result = await useCases.changePassword.execute({
        userId,
        currentPassword,
        newPassword,
      })

      if (!result.ok) {
        if (result.error === 'USER_NOT_FOUND') {
          return reply.status(404).send({ message: 'Usuário não encontrado' })
        }

        if (result.error === 'INVALID_CURRENT_PASSWORD') {
          return reply.status(401).send({ message: 'Senha atual incorreta' })
        }

        return reply.status(500).send({ message: 'Erro ao atualizar senha' })
      }

      return reply.send(result.value)
    }
  )
}
