ALTER TABLE "themes" ADD COLUMN "category" varchar(50) DEFAULT 'minimal' NOT NULL;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "cover_emoji" varchar(10) DEFAULT '🎨' NOT NULL;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "background_pattern" text;