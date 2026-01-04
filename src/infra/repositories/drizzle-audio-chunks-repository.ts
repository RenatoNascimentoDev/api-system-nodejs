import { and, eq, sql as rawSql } from 'drizzle-orm'
import { db as database } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import type {
  AudioChunkSimilarity,
  AudioChunksRepository,
} from '../../domain/ports/audio-chunks-repository.ts'

export class DrizzleAudioChunksRepository implements AudioChunksRepository {
  async create(data: {
    roomId: string
    transcription: string
    embeddings: number[]
    durationSeconds: number
  }): Promise<{ id: string }> {
    const { roomId, transcription, embeddings, durationSeconds } = data

    const records = await database
      .insert(schema.audiosChunks)
      .values({
        roomId,
        transcription,
        embeddings,
        durationSeconds,
      })
      .returning({ id: schema.audiosChunks.id })

    const createdRecord = records[0]

    if (!createdRecord?.id) {
      throw new Error('Failed to create audio chunk')
    }

    return { id: createdRecord.id }
  }

  async findRelevant(params: {
    roomId: string
    embeddings: number[]
    minScore: number
    limit: number
  }): Promise<AudioChunkSimilarity[]> {
    const { roomId, embeddings, minScore, limit } = params

    const vectorLiteral = rawSql`${`[${embeddings.join(',')}]`}::vector`

    const results = await database
      .select({
        id: schema.audiosChunks.id,
        transcription: schema.audiosChunks.transcription,
        similarity: rawSql<number>`1 - (${schema.audiosChunks.embeddings} <=> ${vectorLiteral})`,
      })
      .from(schema.audiosChunks)
      .where(
        and(
          eq(schema.audiosChunks.roomId, roomId),
          rawSql`1 - (${schema.audiosChunks.embeddings} <=> ${vectorLiteral}) > ${minScore}`
        )
      )
      .orderBy(rawSql`${schema.audiosChunks.embeddings} <=> ${vectorLiteral}`)
      .limit(limit)

    return results
  }
}
