"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"

export type EventStatus = "going" | "maybe" | "not-going" | "active"

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: string
  description?: string
  image?: string
  attendees: number
  isFeatured?: boolean
  status?: EventStatus
  organizer?: {
    id?: string
    name?: string | null
    image?: string | null
    department?: string | null
    email?: string | null
  } | null
}

interface EventsContextType {
  events: Event[]
  myEvents: Event[]
  loading: boolean
  refresh: () => Promise<void>
  addEvent: (event: Omit<Event, "id" | "attendees">) => Promise<Event | null>
  rsvpToEvent: (eventId: string, status: EventStatus) => Promise<void>
  getEventById: (id: string) => Event | undefined
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { events } = await api.listEvents()
      setEvents(events as Event[])
      if (status === "authenticated") {
        try {
          const mine = await api.myEvents()
          setMyEvents(mine.events as Event[])
        } catch {
          setMyEvents([])
        }
      } else {
        setMyEvents([])
      }
    } catch (err) {
      console.error("Failed to load events", err)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addEvent = async (event: Omit<Event, "id" | "attendees">) => {
    try {
      const { event: created } = await api.createEvent(event)
      await refresh()
      return created as Event
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const rsvpToEvent = async (eventId: string, ourStatus: EventStatus) => {
    if (ourStatus === "active") return
    try {
      await api.rsvpEvent(eventId, ourStatus)
      await refresh()
      router.push("/student/events/my-events")
    } catch (err) {
      console.error(err)
      alert("Could not save your RSVP. Please make sure you're signed in.")
    }
  }

  const getEventById = (id: string) => events.find((event) => event.id === id)

  return (
    <EventsContext.Provider
      value={{ events, myEvents, loading, refresh, addEvent, rsvpToEvent, getEventById }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider.")
  }
  return context
}
