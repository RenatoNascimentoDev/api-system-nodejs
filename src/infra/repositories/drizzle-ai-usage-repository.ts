import { and, eq, sql as rawSql } from 'drizzle-orm'
import { db as database } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import type { AiUsageRepository } from '../../domain/ports/ai-usage-repository.ts'

export class DrizzleAiUsageRepository implements AiUsageRepository {
  async getDailyUsageCount(params: { userId: string; roomId: string; date: Date }): Promise<number> {
    const { userId, roomId, date } = params

    const results = await database
      .select({ questionCount: schema.aiUsage.questionCount })
      .from(schema.aiUsage)
      .where(
        and(
          eq(schema.aiUsage.userId, userId),
          eq(schema.aiUsage.roomId, roomId),
          eq(schema.aiUsage.date, date)
        )
      )
      .limit(1)

    return results[0]?.questionCount ?? 0
  }

  async incrementDailyUsage(params: { userId: string; roomId: string; date: Date }): Promise<number> {
    const { userId, roomId, date } = params

    const results = await database
      .insert(schema.aiUsage)
      .values({ userId, roomId, date, questionCount: 1 })
      .onConflictDoUpdate({
        target: [schema.aiUsage.userId, schema.aiUsage.roomId, schema.aiUsage.date],
        set: { questionCount: rawSql`${schema.aiUsage.questionCount} + 1` },
      })
      .returning({ questionCount: schema.aiUsage.questionCount })

    return results[0]?.questionCount ?? 0
  }
}
