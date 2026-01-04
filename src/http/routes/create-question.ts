import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { useCases } from '../../config/container.ts'
import { authenticate } from '../middleware/authenticate.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body
      const userId = request.user.sub

      const result = await useCases.createQuestion.execute({
        roomId,
        question,
        userId,
      })

      if (!result.ok) {
        if (result.error === 'ROOM_NOT_FOUND') {
          return reply.status(404).send({ message: 'Sala não encontrada' })
        }

        if (result.error === 'FORBIDDEN') {
          return reply.status(403).send({ message: 'Sem permissão para essa sala' })
        }

        if (result.error === 'DAILY_LIMIT_EXCEEDED') {
          return reply.status(429).send({ message: 'Limite diário de perguntas atingido' })
        }

        return reply.status(500).send({ message: 'Erro ao criar pergunta' })
      }

      return reply.status(201).send(result.value)
    }
  )
}
