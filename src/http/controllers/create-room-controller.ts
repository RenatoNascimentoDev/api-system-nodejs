import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function createRoomController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, description } = request.body as { name: string; description?: string | null }
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
