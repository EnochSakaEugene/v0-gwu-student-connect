import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const updateSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  status: z.string().optional(),
  school: z.string().optional(),
  program: z.string().optional(),
  year: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  title: z.string().optional(),
  researchAreas: z.string().optional(),
  officeLocation: z.string().optional(),
  officeHours: z.string().optional(),
  graduationYear: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  courses: z.array(z.string()).optional(),
  links: z.record(z.string()).optional(),
})

export async function GET() {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  const [row] = await db.select().from(users).where(eq(users.id, me.id)).limit(1)
  if (!row) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  // Strip sensitive fields.
  const { passwordHash: _ph, ...safe } = row
  return NextResponse.json({ profile: safe })
}

export async function PATCH(req: Request) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  try {
    const data = updateSchema.parse(await req.json())
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, me.id))
      .returning()
    const { passwordHash: _ph, ...safe } = updated
    return NextResponse.json({ profile: safe })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
