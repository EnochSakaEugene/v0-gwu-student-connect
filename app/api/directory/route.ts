import { NextResponse } from "next/server"
import { eq, or, ilike, and } from "drizzle-orm"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const role = searchParams.get("role") as "student" | "faculty" | "alumni" | null

  const filters = [] as any[]
  if (role) filters.push(eq(users.role, role))
  if (q) {
    filters.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`), ilike(users.program, `%${q}%`)))
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      school: users.school,
      program: users.program,
      year: users.year,
      department: users.department,
      title: users.title,
      company: users.company,
      jobTitle: users.jobTitle,
      industry: users.industry,
      location: users.location,
    })
    .from(users)
    .where(filters.length ? (and(...filters) as any) : undefined)
    .limit(100)

  return NextResponse.json({ people: rows })
}
