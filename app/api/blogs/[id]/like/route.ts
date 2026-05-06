import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { blogLikes } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  const [existing] = await db
    .select()
    .from(blogLikes)
    .where(and(eq(blogLikes.blogId, params.id), eq(blogLikes.userId, user.id)))
    .limit(1)

  if (existing) {
    await db
      .delete(blogLikes)
      .where(and(eq(blogLikes.blogId, params.id), eq(blogLikes.userId, user.id)))
    return NextResponse.json({ liked: false })
  }
  await db.insert(blogLikes).values({ blogId: params.id, userId: user.id })
  return NextResponse.json({ liked: true })
}
