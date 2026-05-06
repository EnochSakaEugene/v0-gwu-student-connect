import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { eventRsvps, events, users } from "@/lib/db/schema"
import { getSessionUser, isResponse, requireSessionUser } from "@/lib/api-helpers"

const createEventSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  isFeatured: z.boolean().optional(),
})

export async function GET() {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      time: events.time,
      location: events.location,
      category: events.category,
      description: events.description,
      image: events.image,
      isFeatured: events.isFeatured,
      attendees: events.attendees,
      organizerId: events.organizerId,
      createdAt: events.createdAt,
      organizerName: users.name,
      organizerEmail: users.email,
      organizerImage: users.image,
      organizerDepartment: users.department,
    })
    .from(events)
    .leftJoin(users, eq(events.organizerId, users.id))
    .orderBy(desc(events.createdAt))

  return NextResponse.json({
    events: rows.map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      time: r.time,
      location: r.location,
      category: r.category,
      description: r.description,
      image: r.image,
      isFeatured: r.isFeatured,
      attendees: r.attendees,
      organizer: r.organizerId
        ? {
            id: r.organizerId,
            name: r.organizerName,
            email: r.organizerEmail,
            image: r.organizerImage,
            department: r.organizerDepartment,
          }
        : null,
    })),
  })
}

export async function POST(req: Request) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  try {
    const body = await req.json()
    const data = createEventSchema.parse(body)
    const [created] = await db
      .insert(events)
      .values({
        ...data,
        organizerId: user.id,
      })
      .returning()
    return NextResponse.json({ event: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
