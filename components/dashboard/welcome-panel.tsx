"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MessageSquare, Users, Bookmark, Edit, Clock, Plus } from "lucide-react"

interface WelcomePanelProps {
  student: {
    name: string
    avatar?: string
    program: string
    year: string
  }
  stats: {
    messages: number
    appointments: number
    studyGroups: number
    bookmarkedMaterials: number
  }
}

export function WelcomePanel({
  student = {
    name: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    program: "Computer Science",
    year: "Class of 2025",
  },
  stats = {
    messages: 5,
    appointments: 2,
    studyGroups: 3,
    bookmarkedMaterials: 12,
  },
}: Partial<WelcomePanelProps>) {
  const [isLoading, setIsLoading] = useState(false)
  const [studentProfile, setStudentProfile] = useState(student)

  const { status } = useSession()

  useEffect(() => {
    if (status !== "authenticated") return
    const loadProfileData = async () => {
      try {
        const { profile } = await api.myProfile()
        setStudentProfile((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          avatar: profile.image || prev.avatar,
          program: profile.program || prev.program,
          year: profile.year || prev.year,
        }))
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
    loadProfileData()
    const onUpdate = () => loadProfileData()
    window.addEventListener("profileUpdated", onUpdate)
    return () => window.removeEventListener("profileUpdated", onUpdate)
  }, [status])

  return (
    <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-white shadow-sm">
              <AvatarImage src={studentProfile.avatar || "/placeholder.svg"} alt={studentProfile.name} />
              <AvatarFallback className="text-lg bg-[#0033A0] text-white">
                {studentProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0033A0]">
                Welcome back, {studentProfile.name.split(" ")[0]}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-normal">
                  {studentProfile.program}
                </Badge>
                <span className="text-sm text-muted-foreground">{studentProfile.year}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href="/student/profile">
                <Edit className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Edit Profile</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href="/student/settings">
                <Clock className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Set Availability</span>
              </Link>
            </Button>
            <Button size="sm" className="h-9 bg-[#0033A0] hover:bg-[#002180]" asChild>
              <Link href="/student/study-groups/create">
                <Plus className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">Create Study Group</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <Link href="/student/messages" className="block">
            <Card className="bg-white hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">{stats.messages}</p>
                  <p className="text-xs text-muted-foreground whitespace-normal">New Messages</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/appointments/my-appointments" className="block">
            <Card className="bg-white hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">{stats.appointments}</p>
                  <p className="text-xs text-muted-foreground whitespace-normal">Upcoming Appointments</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/study-groups" className="block">
            <Card className="bg-white hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">{stats.studyGroups}</p>
                  <p className="text-xs text-muted-foreground whitespace-normal">Active Study Groups</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/study-materials" className="block">
            <Card className="bg-white hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Bookmark className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">{stats.bookmarkedMaterials}</p>
                  <p className="text-xs text-muted-foreground whitespace-normal">Bookmarked Materials</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
