import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { useCases } from '../../config/container.ts'
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
    async (request, reply) => {
      const { name, description } = request.body
      const userId = request.user.sub

      const result = await useCases.createRoom.execute({
        userId,
        name,
        description,
      })

      if (!result.ok) {
        if (result.error === 'USER_NOT_FOUND') {
          return reply.status(404).send({ message: 'Usuário não encontrado' })
        }

        if (result.error === 'ROOM_LIMIT_REACHED') {
          return reply.status(429).send({ message: 'Limite de salas atingido' })
        }

        return reply.status(500).send({ message: 'Erro ao criar sala' })
      }

      return reply.status(201).send(result.value)
    }
  )
}
