import { NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { studyGroupMembers, studyGroups, users } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/api-helpers"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [row] = await db
    .select({
      id: studyGroups.id,
      name: studyGroups.name,
      description: studyGroups.description,
      course: studyGroups.course,
      subject: studyGroups.subject,
      visibility: studyGroups.visibility,
      tags: studyGroups.tags,
      banner: studyGroups.banner,
      nextMeeting: studyGroups.nextMeeting,
      permissions: studyGroups.permissions,
      createdAt: studyGroups.createdAt,
      updatedAt: studyGroups.updatedAt,
      creatorId: studyGroups.creatorId,
      creatorName: users.name,
      creatorImage: users.image,
      members: sql<number>`(select count(*)::int from ${studyGroupMembers} where ${studyGroupMembers.groupId} = ${studyGroups.id})`,
    })
    .from(studyGroups)
    .leftJoin(users, eq(studyGroups.creatorId, users.id))
    .where(eq(studyGroups.id, params.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "Group not found" }, { status: 404 })

  let isMember = false
  let role: string | null = null
  const me = await getSessionUser()
  if (me) {
    const [membership] = await db
      .select({ role: studyGroupMembers.role })
      .from(studyGroupMembers)
      .where(and(eq(studyGroupMembers.groupId, params.id), eq(studyGroupMembers.userId, me.id)))
      .limit(1)
    if (membership) {
      isMember = true
      role = membership.role
    }
  }

  return NextResponse.json({ group: { ...row, isMember, role } })
}
