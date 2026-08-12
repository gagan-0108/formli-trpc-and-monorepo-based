ALTER TABLE "forms" ADD COLUMN "welcome_title" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "welcome_description" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "welcome_button_text" varchar(50) DEFAULT 'Start';--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "thank_you_title" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "thank_you_message" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "thank_you_button_text" varchar(50);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "thank_you_button_url" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "collect_email" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "close_message" text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "max_responses" integer;