import { FastifyReply, FastifyRequest } from 'fastify'
import { useCases } from '../../config/container.ts'

export async function uploadAudioController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { roomId } = request.params as { roomId: string }
  const userId = request.user.sub
  const audioFile = await request.file()

  if (!audioFile) {
    return reply.status(400).send({ message: 'Audio is required' })
  }

  const audioBuffer = await audioFile.toBuffer()
  const audioAsBase64 = audioBuffer.toString('base64')

  const result = await useCases.uploadAudio.execute({
    roomId,
    userId,
    audioBase64: audioAsBase64,
    mimeType: audioFile.mimetype,
  })

  if (!result.ok) {
    if (result.error === 'ROOM_NOT_FOUND') {
      return reply.status(404).send({ message: 'Sala não encontrada' })
    }

    if (result.error === 'FORBIDDEN') {
      return reply.status(403).send({ message: 'Sem permissão para esta sala' })
    }

    if (result.error === 'ROOM_AUDIO_LIMIT') {
      return reply.status(429).send({ message: 'Limite de áudios da sala atingido' })
    }

    if (result.error === 'AUDIO_TOO_LONG') {
      return reply.status(400).send({ message: 'Áudio excede 60 segundos' })
    }

    return reply.status(500).send({ message: 'Erro ao salvar chunk de áudio' })
  }

  return reply.status(201).send(result.value)
}
