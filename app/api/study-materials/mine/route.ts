import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { materialDownloads, materialFavorites, studyMaterials } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function GET(req: Request) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  const { searchParams } = new URL(req.url)
  const tab = searchParams.get("tab") ?? "uploaded"

  if (tab === "favorites") {
    const rows = await db
      .select({ material: studyMaterials })
      .from(materialFavorites)
      .innerJoin(studyMaterials, eq(materialFavorites.materialId, studyMaterials.id))
      .where(eq(materialFavorites.userId, user.id))
      .orderBy(desc(materialFavorites.createdAt))
    return NextResponse.json({ materials: rows.map((r) => r.material) })
  }

  if (tab === "downloaded") {
    const rows = await db
      .select({ material: studyMaterials })
      .from(materialDownloads)
      .innerJoin(studyMaterials, eq(materialDownloads.materialId, studyMaterials.id))
      .where(eq(materialDownloads.userId, user.id))
      .orderBy(desc(materialDownloads.downloadedAt))
    return NextResponse.json({ materials: rows.map((r) => r.material) })
  }

  // default: uploaded
  const rows = await db
    .select()
    .from(studyMaterials)
    .where(eq(studyMaterials.uploaderId, user.id))
    .orderBy(desc(studyMaterials.createdAt))
  return NextResponse.json({ materials: rows })
}
