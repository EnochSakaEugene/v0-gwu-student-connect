import { NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { blogComments, blogLikes, blogs, users } from "@/lib/db/schema"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [row] = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      excerpt: blogs.excerpt,
      content: blogs.content,
      type: blogs.type,
      visibility: blogs.visibility,
      tags: blogs.tags,
      coverImage: blogs.coverImage,
      createdAt: blogs.createdAt,
      isFeatured: blogs.isFeatured,
      authorId: blogs.authorId,
      authorName: users.name,
      authorImage: users.image,
      authorDepartment: users.department,
      authorProgram: users.program,
      likeCount: sql<number>`(select count(*)::int from ${blogLikes} where ${blogLikes.blogId} = ${blogs.id})`,
      commentCount: sql<number>`(select count(*)::int from ${blogComments} where ${blogComments.blogId} = ${blogs.id})`,
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .where(eq(blogs.id, params.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "Blog not found" }, { status: 404 })
  return NextResponse.json({
    blog: {
      ...row,
      author: row.authorName ?? "Unknown",
      authorRole: row.authorProgram ?? row.authorDepartment ?? "Member",
      date: row.createdAt,
    },
  })
}
