ALTER TABLE "audio_chunks" ADD COLUMN "duration_seconds" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "audio_uploads" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_rooms_created" integer DEFAULT 0 NOT NULL;