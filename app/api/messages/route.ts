import { NextResponse } from "next/server"
import { and, desc, eq, or } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { messages } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const sendSchema = z.object({ toId: z.string(), body: z.string().min(1) })

export async function GET(req: Request) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  const { searchParams } = new URL(req.url)
  const peer = searchParams.get("peer")
  if (peer) {
    const rows = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromId, me.id), eq(messages.toId, peer)),
          and(eq(messages.fromId, peer), eq(messages.toId, me.id)),
        ),
      )
      .orderBy(desc(messages.createdAt))
    return NextResponse.json({ messages: rows })
  }
  const rows = await db
    .select()
    .from(messages)
    .where(or(eq(messages.fromId, me.id), eq(messages.toId, me.id)))
    .orderBy(desc(messages.createdAt))
  return NextResponse.json({ messages: rows })
}

export async function POST(req: Request) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  try {
    const { toId, body } = sendSchema.parse(await req.json())
    const [created] = await db
      .insert(messages)
      .values({ fromId: me.id, toId, body })
      .returning()
    return NextResponse.json({ message: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
