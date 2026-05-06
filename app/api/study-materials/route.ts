import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { studyMaterials, users } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileType: z.string().min(1),
  fileUrl: z.string().optional(),
  fileSize: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET() {
  const rows = await db
    .select({
      id: studyMaterials.id,
      title: studyMaterials.title,
      description: studyMaterials.description,
      fileType: studyMaterials.fileType,
      fileUrl: studyMaterials.fileUrl,
      fileSize: studyMaterials.fileSize,
      tags: studyMaterials.tags,
      rating: studyMaterials.rating,
      ratingCount: studyMaterials.ratingCount,
      views: studyMaterials.views,
      downloads: studyMaterials.downloads,
      createdAt: studyMaterials.createdAt,
      uploaderId: studyMaterials.uploaderId,
      uploaderName: users.name,
      uploaderImage: users.image,
    })
    .from(studyMaterials)
    .leftJoin(users, eq(studyMaterials.uploaderId, users.id))
    .orderBy(desc(studyMaterials.createdAt))

  return NextResponse.json({
    materials: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      fileType: r.fileType,
      fileUrl: r.fileUrl,
      fileSize: r.fileSize,
      tags: r.tags,
      rating: r.rating / 10,
      ratingCount: r.ratingCount,
      views: r.views,
      downloads: r.downloads,
      uploadDate: r.createdAt,
      uploader: { name: r.uploaderName ?? "Unknown", avatar: r.uploaderImage },
    })),
  })
}

export async function POST(req: Request) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user
  try {
    const data = createSchema.parse(await req.json())
    const [created] = await db
      .insert(studyMaterials)
      .values({
        ...data,
        tags: data.tags ?? [],
        uploaderId: user.id,
      })
      .returning()
    return NextResponse.json({ material: created }, { status: 201 })
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 })
  }
}
