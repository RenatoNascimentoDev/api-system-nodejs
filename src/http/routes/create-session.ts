import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { useCases } from '../../config/container.ts'

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
    async (request, reply) => {
      const { email, password } = request.body

      const result = await useCases.createSession.execute({ email, password })

      if (!result.ok) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const token = await reply.jwtSign({ sub: result.value.userId })

      return reply.send({
        token,
        user: {
          id: result.value.userId,
          name: result.value.name,
          email: result.value.email,
        },
      })
    }
  )
}
