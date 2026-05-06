import { NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { eventRsvps, events } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const rsvpSchema = z.object({
  status: z.enum(["going", "maybe", "not-going"]),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  try {
    const { status } = rsvpSchema.parse(await req.json())

    const [existing] = await db
      .select({ status: eventRsvps.status })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, params.id), eq(eventRsvps.userId, user.id)))
      .limit(1)

    const wasGoing = existing?.status === "going"
    const isGoing = status === "going"

    if (existing) {
      await db
        .update(eventRsvps)
        .set({ status })
        .where(and(eq(eventRsvps.eventId, params.id), eq(eventRsvps.userId, user.id)))
    } else {
      await db.insert(eventRsvps).values({ eventId: params.id, userId: user.id, status })
    }

    // Adjust attendees count
    let delta = 0
    if (!wasGoing && isGoing) delta = 1
    else if (wasGoing && !isGoing) delta = -1
    if (delta !== 0) {
      await db
        .update(events)
        .set({ attendees: sql`GREATEST(0, ${events.attendees} + ${delta})` })
        .where(eq(events.id, params.id))
    }

    return NextResponse.json({ ok: true, status })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 })
  }
}
