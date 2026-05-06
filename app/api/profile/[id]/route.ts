import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(users).where(eq(users.id, params.id)).limit(1)
  if (!row) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  const { passwordHash: _ph, ...safe } = row
  return NextResponse.json({ profile: safe })
}
