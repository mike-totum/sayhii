import { defineConfig } from "drizzle-kit";

// Migrations target Neon Postgres (provisioned via the Vercel Marketplace).
// DATABASE_URL is injected by the Vercel integration; pull it locally with
// `vercel env pull .env.local` before running migrations.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "",
  },
});
