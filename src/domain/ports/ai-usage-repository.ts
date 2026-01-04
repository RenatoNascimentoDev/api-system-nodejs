export interface AiUsageRepository {
  getDailyUsageCount(params: { userId: string; roomId: string; date: Date }): Promise<number>
  incrementDailyUsage(params: { userId: string; roomId: string; date: Date }): Promise<number>
}
