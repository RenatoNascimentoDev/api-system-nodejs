import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull().unique(),
    passwordHash: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    totalRoomsCreated: integer().notNull().default(0),
})
