import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_rYPm8Kd6IhuT@ep-nameless-sun-aqh973xq-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  },
  verbose: true,
  strict: true,
} satisfies Config;
