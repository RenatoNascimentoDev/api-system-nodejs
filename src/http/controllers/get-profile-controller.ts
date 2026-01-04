import { FastifyReply, FastifyRequest } from 'fastify'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

const avatarsDir = join(process.cwd(), 'uploads', 'avatars')

export async function getProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const user = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  const account = user[0]

  if (!account) {
    return reply.status(404).send({ message: 'Usuário não encontrado' })
  }

  let avatarUrl: string | null = account.avatarUrl ?? null

  if (!avatarUrl) {
    try {
      const avatarPath = join(avatarsDir, `${userId}.txt`)
      avatarUrl = await fs.readFile(avatarPath, 'utf-8')
    } catch {
      avatarUrl = null
    }
  }

  return {
    user: {
      ...account,
      avatarUrl,
    },
  }
}
