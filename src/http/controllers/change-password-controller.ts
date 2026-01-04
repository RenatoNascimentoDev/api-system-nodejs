import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { currentPassword, newPassword } = request.body as {
    currentPassword: string
    newPassword: string
  }
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
