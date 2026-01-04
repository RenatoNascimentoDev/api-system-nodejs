export interface AudioChunkSimilarity {
  id: string
  transcription: string
  similarity: number
}

export interface AudioChunksRepository {
  create(data: { roomId: string; transcription: string; embeddings: number[]; durationSeconds: number }): Promise<{ id: string }>
  findRelevant(params: {
    roomId: string
    embeddings: number[]
    minScore: number
    limit: number
  }): Promise<AudioChunkSimilarity[]>
}
