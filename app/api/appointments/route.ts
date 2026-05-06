import { NextResponse } from "next/server"
import { and, desc, eq, or } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { appointments, users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const createSchema = z.object({
  facultyId: z.string(),
  scheduledAt: z.string(), // ISO string
  durationMinutes: z.number().int().positive().optional(),
  topic: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  const rows = await db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      durationMinutes: appointments.durationMinutes,
      status: appointments.status,
      topic: appointments.topic,
      notes: appointments.notes,
      studentId: appointments.studentId,
      facultyId: appointments.facultyId,
    })
    .from(appointments)
    .where(or(eq(appointments.studentId, me.id), eq(appointments.facultyId, me.id)))
    .orderBy(desc(appointments.scheduledAt))
  return NextResponse.json({ appointments: rows })
}

export async function POST(req: Request) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  try {
    const data = createSchema.parse(await req.json())
    const [created] = await db
      .insert(appointments)
      .values({
        studentId: me.id,
        facultyId: data.facultyId,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes ?? 30,
        topic: data.topic,
        notes: data.notes,
      })
      .returning()
    return NextResponse.json({ appointment: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
