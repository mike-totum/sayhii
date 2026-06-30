CREATE TYPE "public"."card_person_role" AS ENUM('owner', 'tagged');--> statement-breakpoint
CREATE TYPE "public"."card_priority" AS ENUM('none', 'low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TABLE "work_card_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_card_people" (
	"card_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role" "card_person_role" DEFAULT 'owner' NOT NULL,
	CONSTRAINT "work_card_people_card_id_person_id_role_pk" PRIMARY KEY("card_id","person_id","role")
);
--> statement-breakpoint
CREATE TABLE "work_card_subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "color" text DEFAULT '#6366f1' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_cards" ADD COLUMN "priority" "card_priority" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_cards" ADD COLUMN "labels" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_cards" ADD COLUMN "start_date" text;--> statement-breakpoint
ALTER TABLE "work_card_comments" ADD CONSTRAINT "work_card_comments_card_id_work_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."work_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_card_people" ADD CONSTRAINT "work_card_people_card_id_work_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."work_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_card_people" ADD CONSTRAINT "work_card_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_card_subtasks" ADD CONSTRAINT "work_card_subtasks_card_id_work_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."work_cards"("id") ON DELETE cascade ON UPDATE no action;