import "server-only";
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import * as schema from "./schema";

// Admin-portal Postgres (Aurora Serverless v2) over the RDS Data API.
// HTTPS + IAM, no public DB endpoint or connection pool — serverless-safe.
// Configured via env (set in Vercel from the provisioned cluster):
//   RDS_RESOURCE_ARN, RDS_SECRET_ARN, RDS_DATABASE, AWS_REGION
const rds = new RDSDataClient({ region: process.env.AWS_REGION ?? "us-east-1" });

export const db = drizzle(rds, {
  database: process.env.RDS_DATABASE ?? "sayhii_admin",
  secretArn: process.env.RDS_SECRET_ARN ?? "",
  resourceArn: process.env.RDS_RESOURCE_ARN ?? "",
  schema,
});

export const isDbConfigured = Boolean(
  process.env.RDS_RESOURCE_ARN && process.env.RDS_SECRET_ARN,
);

export { schema };
