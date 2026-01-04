import { compare, hash } from 'bcryptjs'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
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

      const user = await db
        .select({
          id: schema.users.id,
          passwordHash: schema.users.passwordHash,
        })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1)

      const account = user[0]
      if (!account) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      const isPasswordValid = await compare(currentPassword, account.passwordHash)
      if (!isPasswordValid) {
        return reply.status(401).send({ message: 'Senha atual incorreta' })
      }

      const newPasswordHash = await hash(newPassword, 10)

      await db
        .update(schema.users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(schema.users.id, userId))

      return reply.send({ message: 'Senha atualizada com sucesso' })
    }
  )
}
