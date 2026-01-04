import { db as database } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import type { QuestionsRepository } from '../../domain/ports/questions-repository.ts'

export class DrizzleQuestionsRepository implements QuestionsRepository {
  async create(data: {
    roomId: string
    question: string
    answer: string | null
    userId: string
  }): Promise<{ id: string }> {
    const { roomId, question, answer, userId } = data

    const records = await database
      .insert(schema.questions)
      .values({ roomId, question, answer, userId })
      .returning({ id: schema.questions.id })

    const createdRecord = records[0]

    if (!createdRecord?.id) {
      throw new Error('Failed to create question')
    }

    return { id: createdRecord.id }
  }
}
