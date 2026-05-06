import { NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { materialDownloads, studyMaterials } from "@/lib/db/schema"
import { isResponse, requireSessionUser } from "@/lib/api-helpers"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireSessionUser()
  if (isResponse(user)) return user

  await db
    .insert(materialDownloads)
    .values({ materialId: params.id, userId: user.id })
    .onConflictDoNothing()
  await db
    .update(studyMaterials)
    .set({ downloads: sql`${studyMaterials.downloads} + 1` })
    .where(eq(studyMaterials.id, params.id))

  return NextResponse.json({ ok: true })
}
