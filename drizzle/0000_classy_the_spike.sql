CREATE TYPE "public"."goal_status" AS ENUM('on_track', 'done', 'missed');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('personal', 'professional');--> statement-breakpoint
CREATE TYPE "public"."initiative_status" AS ENUM('not_started', 'on_track', 'at_risk', 'done');--> statement-breakpoint
CREATE TYPE "public"."note_scope" AS ENUM('user', 'company');--> statement-breakpoint
CREATE TYPE "public"."note_visibility" AS ENUM('personal', 'public');--> statement-breakpoint
CREATE TYPE "public"."work_column" AS ENUM('backlog', 'in_progress', 'review', 'done');--> statement-breakpoint
CREATE TABLE "customer_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" "note_scope" NOT NULL,
	"subject" text NOT NULL,
	"organization" text NOT NULL,
	"author_email" text NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"visibility" "note_visibility" DEFAULT 'public' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_departments" (
	"initiative_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	CONSTRAINT "initiative_departments_initiative_id_department_id_pk" PRIMARY KEY("initiative_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"owner_id" uuid,
	"status" "initiative_status" DEFAULT 'not_started' NOT NULL,
	"target_date" text DEFAULT '' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"department_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"type" "goal_type" NOT NULL,
	"text" text NOT NULL,
	"status" "goal_status" DEFAULT 'on_track' NOT NULL,
	"week_of" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"column" "work_column" DEFAULT 'backlog' NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"assignee_id" uuid,
	"initiative_id" uuid,
	"due_date" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "initiative_departments" ADD CONSTRAINT "initiative_departments_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_departments" ADD CONSTRAINT "initiative_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_owner_id_people_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_assignee_id_people_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE set null ON UPDATE no action;