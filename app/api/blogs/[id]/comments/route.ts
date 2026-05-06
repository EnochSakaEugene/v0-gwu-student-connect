import { NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { blogComments, users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const commentSchema = z.object({ content: z.string().min(1) })

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rows = await db
    .select({
      id: blogComments.id,
      content: blogComments.content,
      createdAt: blogComments.createdAt,
      authorId: blogComments.authorId,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(blogComments)
    .leftJoin(users, eq(blogComments.authorId, users.id))
    .where(eq(blogComments.blogId, params.id))
    .orderBy(asc(blogComments.createdAt))
  return NextResponse.json({ comments: rows })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user
  try {
    const { content } = commentSchema.parse(await req.json())
    const [created] = await db
      .insert(blogComments)
      .values({ blogId: params.id, authorId: user.id, content })
      .returning()
    return NextResponse.json({ comment: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
