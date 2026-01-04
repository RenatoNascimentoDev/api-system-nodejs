import { compare } from 'bcryptjs'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

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

      const user = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          passwordHash: schema.users.passwordHash,
        })
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)

      const account = user[0]

      if (!account) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const isPasswordValid = await compare(password, account.passwordHash)

      if (!isPasswordValid) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const token = await reply.jwtSign({ sub: account.id })

      return reply.send({
        token,
        user: {
          id: account.id,
          name: account.name,
          email: account.email
        },
      })
    }
  )
}
