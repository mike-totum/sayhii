import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Admin-portal Postgres (Neon, provisioned via the Vercel Marketplace).
// The Vercel integration injects the connection string as an env var.
const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

export const isDbConfigured = Boolean(connectionString);

// neon() is lazy — constructing it without a real URL is fine; it only fails
// when a query actually runs, so the app still builds before the DB exists.
const sql = neon(connectionString || "postgres://placeholder/placeholder");

export const db = drizzle(sql, { schema });

export { schema };
