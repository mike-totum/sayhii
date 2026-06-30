// Drizzle schema for the admin portal's own Postgres (Aurora Serverless v2).
// Two domains: Team Tracking (internal staff ops) and Customer Success notes.
// Participation data is NOT here — it stays in sayhii-core (live product data).

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---- enums ----------------------------------------------------------------

// Portal access role within Team Tracking (distinct from a person's job title).
export const teamRole = pgEnum("team_role", ["admin", "member"]);
export const goalType = pgEnum("goal_type", ["personal", "professional"]);
export const goalStatus = pgEnum("goal_status", ["on_track", "done", "missed"]);
export const initiativeStatus = pgEnum("initiative_status", [
  "not_started",
  "on_track",
  "at_risk",
  "done",
]);
export const workColumn = pgEnum("work_column", [
  "backlog",
  "in_progress",
  "review",
  "done",
]);
export const cardPriority = pgEnum("card_priority", [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);
// owner = responsible; tagged = collaborator / watcher / FYI.
export const cardPersonRole = pgEnum("card_person_role", ["owner", "tagged"]);
export const noteScope = pgEnum("note_scope", ["user", "company"]);
export const noteVisibility = pgEnum("note_visibility", ["personal", "public"]);

// ---- Team Tracking --------------------------------------------------------

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  role: text("role").notNull().default(""),
  // Per-person color used for owner/tag chips across the board. Hex string;
  // auto-assigned on create, editable.
  color: text("color").notNull().default("#6366f1"),
  // Photo URL (e.g. from Google profile); falls back to color-initials avatar.
  photoUrl: text("photo_url"),
  departmentId: uuid("department_id").references(() => departments.id, {
    onDelete: "set null",
  }),
  // Access role + lifecycle. admin manages the team; member self-serves.
  // Deactivate (active=false) instead of deleting so history stays attributable.
  accessRole: teamRole("access_role").notNull().default("member"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const weeklyGoals = pgTable("weekly_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  type: goalType("type").notNull(),
  text: text("text").notNull(),
  status: goalStatus("status").notNull().default("on_track"),
  weekOf: text("week_of").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const initiatives = pgTable("initiatives", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  ownerId: uuid("owner_id").references(() => people.id, { onDelete: "set null" }),
  status: initiativeStatus("status").notNull().default("not_started"),
  targetDate: text("target_date").notNull().default(""),
  progress: integer("progress").notNull().default(0),
  summary: text("summary").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// many-to-many: an initiative spans departments
export const initiativeDepartments = pgTable(
  "initiative_departments",
  {
    initiativeId: uuid("initiative_id")
      .notNull()
      .references(() => initiatives.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.initiativeId, t.departmentId] })],
);

export const workCards = pgTable("work_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  column: workColumn("column").notNull().default("backlog"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // assigneeId kept for back-compat; multi-owner now lives in workCardPeople.
  assigneeId: uuid("assignee_id").references(() => people.id, { onDelete: "set null" }),
  initiativeId: uuid("initiative_id").references(() => initiatives.id, {
    onDelete: "set null",
  }),
  priority: cardPriority("priority").notNull().default("none"),
  labels: text("labels").array().notNull().default([]),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Owners + tagged collaborators on a card (the colored chips). role splits the
// two; a person appears at most once per role on a card.
export const workCardPeople = pgTable(
  "work_card_people",
  {
    cardId: uuid("card_id")
      .notNull()
      .references(() => workCards.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: cardPersonRole("role").notNull().default("owner"),
  },
  (t) => [primaryKey({ columns: [t.cardId, t.personId, t.role] })],
);

// Checklist / subtasks on a card, with progress.
export const workCardSubtasks = pgTable("work_card_subtasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => workCards.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Comments / activity log on a card; author asserted from the staff session.
export const workCardComments = pgTable("work_card_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => workCards.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Customer Success notes ----------------------------------------------

export const customerNotes = pgTable("customer_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  scope: noteScope("scope").notNull(),
  subject: text("subject").notNull(), // user email or company name
  organization: text("organization").notNull(),
  authorEmail: text("author_email").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  visibility: noteVisibility("visibility").notNull().default("public"),
  tags: text("tags").array().notNull().default([]),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
