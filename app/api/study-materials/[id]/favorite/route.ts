import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { materialFavorites } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  const [existing] = await db
    .select()
    .from(materialFavorites)
    .where(and(eq(materialFavorites.materialId, params.id), eq(materialFavorites.userId, user.id)))
    .limit(1)

  if (existing) {
    await db
      .delete(materialFavorites)
      .where(and(eq(materialFavorites.materialId, params.id), eq(materialFavorites.userId, user.id)))
    return NextResponse.json({ favorite: false })
  }
  await db.insert(materialFavorites).values({ materialId: params.id, userId: user.id })
  return NextResponse.json({ favorite: true })
}
