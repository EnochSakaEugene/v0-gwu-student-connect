import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (!row) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const { passwordHash: _ph, ...safe } = row

  return NextResponse.json({ profile: safe })
}
