import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { useCases } from '../../config/container.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/users',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const result = await useCases.createUser.execute({
        name,
        email,
        password,
      })

      if (!result.ok) {
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          return reply.status(409).send({ message: 'Email já cadastrado' })
        }

        return reply.status(500).send({ message: 'Erro ao criar usuário' })
      }

      return reply.status(201).send({ userId: result.value.userId })
    }
  )
}
