import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function createQuestionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { roomId } = request.params as { roomId: string }
  const { question } = request.body as { question: string }
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
