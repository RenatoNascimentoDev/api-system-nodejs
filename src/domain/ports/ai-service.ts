export interface AIService {
  transcribeAudio(audioAsBase64: string, mimeType: string): Promise<{ text: string; durationSeconds: number }>
  generateEmbeddings(text: string): Promise<number[]>
  generateAnswer(question: string, transcriptions: string[]): Promise<string>
}
