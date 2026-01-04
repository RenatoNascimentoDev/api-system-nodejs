import OpenAI, { toFile } from 'openai'
import { env } from '../../env.ts'
import type { AIService } from '../../domain/ports/ai-service.ts'

export class OpenAiAiService implements AIService {
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  async transcribeAudio(audioAsBase64: string, mimeType: string): Promise<{ text: string; durationSeconds: number }> {
    const buffer = Buffer.from(audioAsBase64, 'base64')
    const file = await toFile(buffer, `audio.${mimeType.split('/')[1] ?? 'webm'}`)

    const response = await this.client.audio.transcriptions.create({
      file,
      model: env.OPENAI_MODEL_AUDIO,
      language: 'pt',
    })

    if (!response.text) {
      throw new Error('Failed to transcribe audio')
    }

    const durationSeconds =
      typeof (response as unknown as { duration?: number }).duration === 'number'
        ? (response as unknown as { duration?: number }).duration!
        : 0

    return { text: response.text, durationSeconds }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: env.OPENAI_MODEL_EMBED,
      input: text,
    })

    const embedding = response.data[0]?.embedding

    if (!embedding) {
      throw new Error('Failed to generate embeddings')
    }

    return embedding
  }

  async generateAnswer(question: string, transcriptions: string[]): Promise<string> {
    const context = transcriptions.join('\n\n')

    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL_CHAT,
      messages: [
        {
          role: 'system',
          content: 'Responda em português do Brasil, de forma clara e objetiva, usando apenas o contexto fornecido.',
        },
        { role: 'user', content: `Contexto:\n${context}\n\nPergunta:\n${question}` },
      ],
      temperature: 0.2,
    })

    const message = response.choices[0]?.message?.content

    if (!message) {
      throw new Error('Failed to generate answer')
    }

    return message
  }
}
