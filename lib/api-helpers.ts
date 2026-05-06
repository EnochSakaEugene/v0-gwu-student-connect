import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export type ApiUser = {
  id: string
  email: string
  name?: string | null
  role: "student" | "faculty" | "alumni"
}

export async function getSessionUser(): Promise<ApiUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as ApiUser
}

export async function requireSessionUser(): Promise<ApiUser | NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return user
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse
}
