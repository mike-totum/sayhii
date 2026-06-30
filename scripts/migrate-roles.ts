// Adds access_role / active / photo_url to people, and seeds the bootstrap
// admin (Mike). Idempotent — safe to re-run. Run:
//   npx dotenv-cli -e .env.local -- npx tsx scripts/migrate-roles.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`DO $$ BEGIN
    CREATE TYPE team_role AS ENUM ('admin', 'member');
  EXCEPTION WHEN duplicate_object THEN null; END $$`;

  await sql`ALTER TABLE people ADD COLUMN IF NOT EXISTS access_role team_role NOT NULL DEFAULT 'member'`;
  await sql`ALTER TABLE people ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true`;
  await sql`ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_url text`;

  // Seed the bootstrap admin so Mike has a profile + can manage the team.
  await sql`
    INSERT INTO people (name, email, role, color, access_role)
    SELECT 'Michael Bomhoff', 'michael.bomhoff@sayhii.io', 'COO', '#ff4d2e', 'admin'
    WHERE NOT EXISTS (
      SELECT 1 FROM people WHERE lower(email) = 'michael.bomhoff@sayhii.io'
    )
  `;

  const rows = await sql`SELECT name, email, access_role, active FROM people ORDER BY created_at`;
  console.log("people:", rows);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
