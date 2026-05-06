import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Connect a Neon Postgres database to your project on v0/Vercel and add DATABASE_URL to your environment variables.",
  )
}

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })
export { schema }
