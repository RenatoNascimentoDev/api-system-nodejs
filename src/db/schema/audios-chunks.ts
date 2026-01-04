import { pgTable, text, timestamp, uuid, vector, numeric } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'

export const audiosChunks = pgTable('audio_chunks', {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  transcription: text().notNull(),
  embeddings: vector({ dimensions: 768}).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  durationSeconds: numeric({ mode: 'number' }).notNull(),
})
