import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const rooms = pgTable('rooms', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  userId: uuid().references(() => users.id).notNull(),
  audioUploads: integer().notNull().default(0),
})
