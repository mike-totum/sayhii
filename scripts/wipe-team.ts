// Wipe Team Tracking data to a clean slate. Leaves customer_notes untouched.
// Run:
//   npx dotenv-cli -e .env.local -- npx tsx scripts/wipe-team.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // CASCADE covers the join/child tables, but list them so intent is explicit
  // and nothing outside Team Tracking is touched.
  await sql`
    TRUNCATE TABLE
      work_card_comments,
      work_card_subtasks,
      work_card_people,
      work_cards,
      initiative_departments,
      initiatives,
      weekly_goals,
      people,
      departments
    RESTART IDENTITY CASCADE
  `;
  console.log("Team Tracking tables wiped. customer_notes left intact.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
