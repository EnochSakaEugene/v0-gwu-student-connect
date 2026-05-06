import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { studyGroupMembers } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

// POST: join the group
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user
  await db
    .insert(studyGroupMembers)
    .values({ groupId: params.id, userId: user.id, role: "member" })
    .onConflictDoNothing()
  return NextResponse.json({ joined: true })
}

// DELETE: leave the group
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user
  await db
    .delete(studyGroupMembers)
    .where(and(eq(studyGroupMembers.groupId, params.id), eq(studyGroupMembers.userId, user.id)))
  return NextResponse.json({ joined: false })
}
