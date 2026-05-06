import { NextResponse } from "next/server"
import { desc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { studyGroupMembers, studyGroups, users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  course: z.string().min(1),
  subject: z.string().min(1),
  visibility: z.enum(["public", "private", "invite-only"]).optional(),
  tags: z.array(z.string()).optional(),
  banner: z.string().optional(),
  nextMeeting: z.string().optional(),
  permissions: z
    .object({
      allowMemberPosts: z.boolean().optional(),
      allowMemberUploads: z.boolean().optional(),
      allowMemberEvents: z.boolean().optional(),
      notifyDashboard: z.boolean().optional(),
    })
    .optional(),
})

export async function GET() {
  const rows = await db
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
      createdAt: studyGroups.createdAt,
      updatedAt: studyGroups.updatedAt,
      creatorId: studyGroups.creatorId,
      creatorName: users.name,
      creatorImage: users.image,
      members: sql<number>`(select count(*)::int from ${studyGroupMembers} where ${studyGroupMembers.groupId} = ${studyGroups.id})`,
    })
    .from(studyGroups)
    .leftJoin(users, eq(studyGroups.creatorId, users.id))
    .orderBy(desc(studyGroups.updatedAt))

  return NextResponse.json({ groups: rows })
}

export async function POST(req: Request) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const [created] = await db
      .insert(studyGroups)
      .values({
        name: data.name,
        description: data.description ?? "",
        course: data.course,
        subject: data.subject,
        visibility: data.visibility ?? "public",
        tags: data.tags ?? [],
        banner: data.banner,
        nextMeeting: data.nextMeeting,
        permissions: data.permissions ?? {},
        creatorId: user.id,
      })
      .returning()

    // Auto-join creator as admin.
    await db.insert(studyGroupMembers).values({
      groupId: created.id,
      userId: user.id,
      role: "admin",
    })

    return NextResponse.json({ group: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
