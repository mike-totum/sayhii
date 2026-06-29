import { defineConfig } from "drizzle-kit";

// Migrations target Aurora Serverless v2 (PostgreSQL) over the RDS Data API.
// The three RDS_* values come from the provisioned cluster (set in Vercel).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "aws-data-api",
  dbCredentials: {
    database: process.env.RDS_DATABASE ?? "sayhii_admin",
    secretArn: process.env.RDS_SECRET_ARN ?? "",
    resourceArn: process.env.RDS_RESOURCE_ARN ?? "",
  },
});
