"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileStudyMaterials } from "@/components/profile/profile-study-materials"
import { ProfileStudyGroups } from "@/components/profile/profile-study-groups"
import { ProfileBlogs } from "@/components/profile/profile-blogs"
import { ProfileEvents } from "@/components/profile/profile-events"
import { ProfileAchievements } from "@/components/profile/profile-achievements"
import { ProfileActivityFeed } from "@/components/profile/profile-activity-feed"
import { ProfilePersonalPosts } from "@/components/profile/profile-personal-posts"
import { ProfileAppointments } from "@/components/profile/profile-appointments"

export default function ProfilePage() {
  // Default student data
  const defaultStudent = {
    id: "current-user",
    name: "Alex Johnson",
    email: "alex.johnson@gwconnect.edu",
    gwid: "G12345678",
    school: "College of Arts & Sciences",
    program: "Psychology",
    year: "Class of 2025",
    interests: ["Cognitive Psychology", "Research Methods", "Mental Health", "Data Science"],
    status: "Working on my research project about digital interventions for anxiety disorders.",
    avatar: "/placeholder.svg?height=128&width=128",
    isCurrentUser: true,
    achievements: [
      {
        id: 1,
        name: "Research Star",
        description: "Completed 5 research projects with faculty members",
        date: "April 2024",
        icon: "award",
      },
      {
        id: 2,
        name: "Study Group Leader",
        description: "Created and led 3 successful study groups",
        date: "March 2024",
        icon: "users",
      },
      {
        id: 3,
        name: "Resource Contributor",
        description: "Shared 10+ study materials with the community",
        date: "February 2024",
        icon: "book",
      },
    ],
  }

  // State to hold student data
  const [student, setStudent] = useState(defaultStudent)

  const { status } = useSession()

  // Load profile from the database
  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api
      .myProfile()
      .then(({ profile }) => {
        if (cancelled) return
        setStudent({
          ...defaultStudent,
          ...profile,
          avatar: profile.image || defaultStudent.avatar,
          isCurrentUser: true,
          // We don't ship achievements as a DB table yet, so keep the defaults.
          achievements: defaultStudent.achievements,
        })
      })
      .catch((err) => console.error("Error loading profile:", err))
    return () => {
      cancelled = true
    }
  }, [status])

  // Handle profile updates
  const handleProfileUpdate = async (updatedProfile: any) => {
    setStudent(updatedProfile)
    try {
      await api.updateProfile({
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        status: updatedProfile.status,
        image: updatedProfile.avatar,
        school: updatedProfile.school,
        program: updatedProfile.program,
        year: updatedProfile.year,
        interests: updatedProfile.interests,
      })
      window.dispatchEvent(new Event("profileUpdated"))
    } catch (err) {
      console.error("Error saving profile:", err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center">
          <MainNav />
          <DashboardHeader role="student" />
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav role="student" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-6">
            <ProfileHeader student={student} onProfileUpdate={handleProfileUpdate} />

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="w-full justify-start border-b pb-px">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="materials">Study Materials</TabsTrigger>
                <TabsTrigger value="groups">Study Groups</TabsTrigger>
                <TabsTrigger value="blogs">Blogs</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <ProfileActivityFeed student={student} />
                  <ProfileBlogs student={student} limit={3} />
                  <ProfileStudyMaterials student={student} limit={3} />
                  <ProfileStudyGroups student={student} limit={3} />
                  <ProfileEvents student={student} limit={3} />
                  <ProfileAppointments student={student} limit={3} />
                </div>
              </TabsContent>
              <TabsContent value="posts" className="mt-6">
                <ProfilePersonalPosts student={student} />
              </TabsContent>
              <TabsContent value="materials" className="mt-6">
                <ProfileStudyMaterials student={student} />
              </TabsContent>
              <TabsContent value="groups" className="mt-6">
                <ProfileStudyGroups student={student} />
              </TabsContent>
              <TabsContent value="blogs" className="mt-6">
                <ProfileBlogs student={student} />
              </TabsContent>
              <TabsContent value="events" className="mt-6">
                <ProfileEvents student={student} />
              </TabsContent>
              <TabsContent value="appointments" className="mt-6">
                <ProfileAppointments student={student} />
              </TabsContent>
              <TabsContent value="achievements" className="mt-6">
                <ProfileAchievements student={student} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
