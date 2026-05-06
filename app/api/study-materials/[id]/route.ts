import { NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { materialFavorites, studyMaterials, users } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/api-helpers"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [row] = await db
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
    .where(eq(studyMaterials.id, params.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "Material not found" }, { status: 404 })

  // Increment view count.
  await db
    .update(studyMaterials)
    .set({ views: sql`${studyMaterials.views} + 1` })
    .where(eq(studyMaterials.id, params.id))

  let isFavorite = false
  const me = await getSessionUser()
  if (me) {
    const [fav] = await db
      .select()
      .from(materialFavorites)
      .where(and(eq(materialFavorites.materialId, params.id), eq(materialFavorites.userId, me.id)))
      .limit(1)
    isFavorite = !!fav
  }

  return NextResponse.json({
    material: {
      ...row,
      rating: row.rating / 10,
      uploadDate: row.createdAt,
      uploader: { name: row.uploaderName ?? "Unknown", avatar: row.uploaderImage },
      isFavorite,
    },
  })
}
