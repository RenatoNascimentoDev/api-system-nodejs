import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL_CHAT: z.string(),
  OPENAI_MODEL_EMBED: z.string(),
  OPENAI_MODEL_AUDIO: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string(),
})

export const env = envSchema.parse(process.env)
