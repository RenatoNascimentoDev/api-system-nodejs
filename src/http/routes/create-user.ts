import { hash } from 'bcryptjs'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/users',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const existingUser = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)

      if (existingUser[0]) {
        return reply.status(409).send({ message: 'Email já cadastrado' })
      }

      const passwordHash = await hash(password, 10)

      await db.insert(schema.users).values({ name, email, passwordHash })

      return reply.status(201).send()
    }
  )
}
