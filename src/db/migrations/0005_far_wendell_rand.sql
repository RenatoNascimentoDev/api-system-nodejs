DROP INDEX "ai_usage_user_room_date_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "ai_usage_user_room_date_idx" ON "ai_usage" USING btree ("user_id","room_id","date");