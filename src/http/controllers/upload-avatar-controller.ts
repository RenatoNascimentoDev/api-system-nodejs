import { FastifyReply, FastifyRequest } from 'fastify'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

const avatarsDir = join(process.cwd(), 'uploads', 'avatars')

const allowedMimes: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
}

export async function uploadAvatarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const file = await request.file()

  if (!file) {
    return reply.status(400).send({ message: 'Nenhum arquivo enviado' })
  }

  if (!allowedMimes[file.mimetype]) {
    return reply.status(415).send({ message: 'Formato de imagem não suportado' })
  }

  const buffer = await file.toBuffer()

  if (buffer.length > 5 * 1024 * 1024) {
    return reply.status(413).send({ message: 'Arquivo excede o limite de 5MB' })
  }

  if (buffer.length === 0) {
    return reply.status(400).send({ message: 'Arquivo vazio' })
  }

  await fs.mkdir(avatarsDir, { recursive: true })

  const userId = request.user.sub
  const dataUrl = `data:${file.mimetype};base64,${buffer.toString('base64')}`
  const avatarPath = join(avatarsDir, `${userId}.txt`)

  await fs.writeFile(avatarPath, dataUrl, 'utf-8')

  await db
    .update(schema.users)
    .set({ avatarUrl: dataUrl })
    .where(eq(schema.users.id, userId))

  return reply.send({ avatarUrl: dataUrl })
}
