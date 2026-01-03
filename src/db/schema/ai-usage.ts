import { pgTable, uuid, date, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users.ts'
import { rooms } from './rooms.ts'

export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().references(() => users.id).notNull(),
    roomId: uuid().references(() => rooms.id).notNull(),
    date: date({ mode: 'date' }).notNull(),
    questionCount: integer().notNull().default(0),
  },
  (table) => ({
    userRoomDateIdx: uniqueIndex('ai_usage_user_room_date_idx').on(table.userId, table.roomId, table.date),
  })
)
