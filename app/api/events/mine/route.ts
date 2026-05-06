import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { eventRsvps, events } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function GET() {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

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
      attendees: events.attendees,
      isFeatured: events.isFeatured,
      status: eventRsvps.status,
    })
    .from(eventRsvps)
    .innerJoin(events, eq(eventRsvps.eventId, events.id))
    .where(eq(eventRsvps.userId, user.id))
    .orderBy(desc(events.createdAt))

  return NextResponse.json({ events: rows })
}
