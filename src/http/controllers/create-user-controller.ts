import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password } = request.body as {
    name: string
    email: string
    password: string
  }

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
