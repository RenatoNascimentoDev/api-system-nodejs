import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { authenticate } from '../middleware/authenticate.ts'

const avatarsDir = join(process.cwd(), 'uploads', 'avatars')

const allowedMimes: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
}

export const uploadAvatarRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/users/avatar',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const file = await request.file()

      if (!file) {
        return reply.status(400).send({ message: 'Nenhum arquivo enviado' })
      }

      if (!allowedMimes[file.mimetype]) {
        return reply.status(415).send({ message: 'Formato de imagem não suportado' })
      }

      const buffer = await file.toBuffer()

      if (buffer.length === 0) {
        return reply.status(400).send({ message: 'Arquivo vazio' })
      }

      await fs.mkdir(avatarsDir, { recursive: true })

      const userId = request.user.sub
      const dataUrl = `data:${file.mimetype};base64,${buffer.toString('base64')}`
      const avatarPath = join(avatarsDir, `${userId}.txt`)

      await fs.writeFile(avatarPath, dataUrl, 'utf-8')

      // apenas garante que o usuário existe para consistência
      await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1)

      return reply.send({ avatarUrl: dataUrl })
    }
  )
}
