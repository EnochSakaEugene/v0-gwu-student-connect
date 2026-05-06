import { NextResponse } from "next/server"
import { desc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { blogComments, blogLikes, blogs, users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const createBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  type: z.enum(["article", "poll"]).optional(),
  visibility: z.enum(["public", "private", "invite-only"]).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
})

export async function GET() {
  const rows = await db
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
      authorRole: users.program,
      authorImage: users.image,
      authorDepartment: users.department,
      likeCount: sql<number>`(select count(*)::int from ${blogLikes} where ${blogLikes.blogId} = ${blogs.id})`,
      commentCount: sql<number>`(select count(*)::int from ${blogComments} where ${blogComments.blogId} = ${blogs.id})`,
    })
    .from(blogs)
    .leftJoin(users, eq(blogs.authorId, users.id))
    .orderBy(desc(blogs.createdAt))

  return NextResponse.json({
    blogs: rows.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      type: r.type,
      visibility: r.visibility,
      tags: r.tags,
      coverImage: r.coverImage,
      isFeatured: r.isFeatured,
      date: r.createdAt,
      author: r.authorName ?? "Unknown",
      authorRole: r.authorRole ?? r.authorDepartment ?? "Member",
      authorId: r.authorId,
      authorImage: r.authorImage,
      likeCount: r.likeCount ?? 0,
      commentCount: r.commentCount ?? 0,
    })),
  })
}

export async function POST(req: Request) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  try {
    const body = await req.json()
    const data = createBlogSchema.parse(body)
    const excerpt =
      data.excerpt ??
      data.content.slice(0, 150) + (data.content.length > 150 ? "..." : "")

    const [created] = await db
      .insert(blogs)
      .values({
        title: data.title,
        content: data.content,
        excerpt,
        type: data.type ?? "article",
        visibility: data.visibility ?? "public",
        tags: data.tags ?? [],
        coverImage: data.coverImage,
        authorId: user.id,
      })
      .returning()
    return NextResponse.json({ blog: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}
