import OpenAI, { toFile } from 'openai';
import { env } from '../env.ts'

const client = new OpenAI( { apiKey: env.OPENAI_API_KEY } )

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const buffer = Buffer.from(audioAsBase64, 'base64')
  const file = await toFile(buffer, `audio.${mimeType.split('/')[1] ?? 'webm'}`)
  const response = await client.audio.transcriptions.create({
    file,
    model: env.OPENAI_MODEL_AUDIO,
    language: 'pt',
  })
  if (!response.text) throw new Error('Falha ao transcrever audio')
  const durationSeconds = typeof (response as any).duration === 'number' ? (response as any).duration : 0
  return { text: response.text, durationSeconds }
}


export async function generateEmbeddings(text: string) {
    const response = await client.embeddings.create({
        model: env.OPENAI_MODEL_EMBED,
        input: text,
    })
    const embedding = response.data[0]?.embedding
    if (!embedding) throw new Error('Falha ao gerar embedding')
        return embedding
}

export async function generateAnswer(question: string, transcription: string[]) {
    const context = transcription.join('\n\n')
    const response = await client.chat.completions.create({
        model: env.OPENAI_MODEL_CHAT,
        messages: [
            { role: 'system', content: 'Responda em português do Brasil, de forma clara e objetiva, usando apenas o contexto fornecido.'},
            { role: 'user', content: `Contexto:\n${context}\n\nPergunta:\n${question}` },
        ],
        temperature: 0.2,
    })
    const message = response.choices[0]?.message?.content
    if (!message) throw new Error('Falha ao gerar resposta')
    return message
}