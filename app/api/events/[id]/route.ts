import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { eventRsvps, events, users } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/api-helpers"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [row] = await db
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
      organizerName: users.name,
      organizerEmail: users.email,
      organizerImage: users.image,
      organizerDepartment: users.department,
    })
    .from(events)
    .leftJoin(users, eq(events.organizerId, users.id))
    .where(eq(events.id, params.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  let myStatus: string | null = null
  const me = await getSessionUser()
  if (me) {
    const [r] = await db
      .select({ status: eventRsvps.status })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, params.id))
      .limit(1)
    myStatus = r?.status ?? null
  }

  return NextResponse.json({
    event: {
      ...row,
      organizer: row.organizerId
        ? {
            id: row.organizerId,
            name: row.organizerName,
            email: row.organizerEmail,
            image: row.organizerImage,
            department: row.organizerDepartment,
          }
        : null,
      myStatus,
    },
  })
}
