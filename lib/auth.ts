import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema"

export const authOptions: NextAuthOptions = {
  // We use JWT sessions so the credentials provider works without a server-side
  // session row per request. The Drizzle adapter still wires up users/accounts.
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, creds.email.toLowerCase()))
          .limit(1)
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(creds.password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          // Keep custom fields available on the JWT.
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
}

export function auth() {
  return getServerSession(authOptions)
}

export async function requireUser() {
  const session = await auth()
  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 })
  }
  return session.user as { id: string; email: string; name?: string; role: "student" | "faculty" | "alumni" }
}
