export interface QuestionsRepository {
  create(data: {
    roomId: string
    question: string
    answer: string | null
    userId: string
  }): Promise<{ id: string }>
}
