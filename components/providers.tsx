"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { EventsProvider } from "@/contexts/events-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <EventsProvider>{children}</EventsProvider>
    </SessionProvider>
  )
}
