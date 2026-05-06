import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { studyGroupMembers, studyGroups } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function GET() {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  const rows = await db
    .select({
      id: studyGroups.id,
      name: studyGroups.name,
      description: studyGroups.description,
      course: studyGroups.course,
      subject: studyGroups.subject,
      visibility: studyGroups.visibility,
      tags: studyGroups.tags,
      role: studyGroupMembers.role,
      joinedAt: studyGroupMembers.joinedAt,
    })
    .from(studyGroupMembers)
    .innerJoin(studyGroups, eq(studyGroups.id, studyGroupMembers.groupId))
    .where(eq(studyGroupMembers.userId, user.id))
    .orderBy(desc(studyGroups.updatedAt))

  return NextResponse.json({ groups: rows })
}
