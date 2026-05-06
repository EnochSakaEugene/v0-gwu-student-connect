import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { follows } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  const [row] = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, me.id), eq(follows.followeeId, params.userId)))
    .limit(1)
  return NextResponse.json({ following: !!row })
}

export async function POST(_req: Request, { params }: { params: { userId: string } }) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  if (me.id === params.userId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
  }
  await db
    .insert(follows)
    .values({ followerId: me.id, followeeId: params.userId })
    .onConflictDoNothing()
  return NextResponse.json({ following: true })
}

export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  const me = await requireSessionUser()
  if (isResponse(me)) return me
  await db
    .delete(follows)
    .where(and(eq(follows.followerId, me.id), eq(follows.followeeId, params.userId)))
  return NextResponse.json({ following: false })
}
