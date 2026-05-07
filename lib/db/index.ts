import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Hard-coded Neon connection string (as requested)
const DATABASE_URL =
  "postgresql://neondb_owner:npg_rYPm8Kd6IhuT@ep-nameless-sun-aqh973xq-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please provide a valid Neon Postgres connection string."
  );
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

export { schema };
