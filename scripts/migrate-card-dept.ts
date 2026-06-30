// Make work_cards.department_id optional — a task's department now follows its
// owner (person), and people without a department are valid. Idempotent. Run:
//   npx dotenv-cli -e .env.local -- npx tsx scripts/migrate-card-dept.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`ALTER TABLE work_cards ALTER COLUMN department_id DROP NOT NULL`;
  console.log("work_cards.department_id is now nullable.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
