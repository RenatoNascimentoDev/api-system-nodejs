import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function createSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as { email: string; password: string }

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
