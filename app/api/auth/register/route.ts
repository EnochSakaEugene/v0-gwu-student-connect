import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "faculty", "alumni"]),
  gwid: z.string().optional(),
  school: z.string().optional(),
  // Student
  program: z.string().optional(),
  year: z.string().optional(),
  // Faculty
  department: z.string().optional(),
  position: z.string().optional(),
  researchAreas: z.string().optional(),
  officeLocation: z.string().optional(),
  officeHours: z.string().optional(),
  // Alumni
  graduationYear: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse({
      ...body,
      role: typeof body.role === "string" ? body.role.toLowerCase() : body.role,
    })

    const email = data.email.toLowerCase()
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const name = `${data.firstName} ${data.lastName}`.trim()

    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        role: data.role,
        gwid: data.gwid,
        school: data.school,
        program: data.program,
        year: data.year,
        department: data.department,
        position: data.position,
        researchAreas: data.researchAreas,
        officeLocation: data.officeLocation,
        officeHours: data.officeHours,
        graduationYear: data.graduationYear,
        company: data.company,
        jobTitle: data.jobTitle,
        industry: data.industry,
        location: data.location,
        interests: data.interests ?? [],
      })
      .returning({ id: users.id, email: users.email, role: users.role, name: users.name })

    return NextResponse.json({ user: created })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
