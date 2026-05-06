"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStudyMaterials } from "@/components/profile/profile-study-materials"
import { ProfileBlogs } from "@/components/profile/profile-blogs"
import { ProfileEvents } from "@/components/profile/profile-events"
import { ProfileAppointments } from "@/components/profile/profile-appointments"
import { Settings } from "lucide-react"

export default function FacultyProfilePage() {
  const [profileData, setProfileData] = useState({
    id: "faculty-123",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@gwu.edu",
    gwid: "G12345678",
    school: "School of Engineering & Applied Science",
    program: "Computer Science",
    year: "Faculty",
    interests: ["Artificial Intelligence", "Machine Learning", "Data Science", "Computer Vision"],
    status: "Available for student consultations this week.",
    avatar: "/placeholder.svg?height=128&width=128",
    isCurrentUser: true,
    title: "Associate Professor",
    department: "Computer Science",
    bio: "Specializing in artificial intelligence and machine learning with over 10 years of teaching experience.",
    officeHours: "Monday and Wednesday, 2:00 PM - 4:00 PM",
    officeLocation: "Science & Engineering Hall, Room 4550",
    courses: ["CSCI 1012: Intro to Programming", "CSCI 4364: Machine Learning", "CSCI 6362: Probabilistic Methods"],
    links: {
      googleScholar: "https://scholar.google.com",
      researchGate: "https://researchgate.net",
      linkedin: "https://linkedin.com",
      website: "https://example.com",
    },
  })

  const { status } = useSession()

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api
      .myProfile()
      .then(({ profile }) => {
        if (cancelled) return
        setProfileData((prev) => ({
          ...prev,
          ...profile,
          avatar: profile.image || prev.avatar,
          courses: profile.courses?.length ? profile.courses : prev.courses,
          links: { ...prev.links, ...(profile.links || {}) },
        }))
      })
      .catch((err) => console.error("Error loading profile:", err))
    return () => {
      cancelled = true
    }
  }, [status])

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader role="faculty" />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav role="faculty" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/faculty/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>

            <ProfileHeader student={profileData} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {profileData.interests.map((interest, index) => (
                      <li key={index}>{interest}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.officeHours}</p>
                  <p className="text-sm text-muted-foreground mt-2">{profileData.officeLocation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {profileData.courses.map((course, index) => (
                      <li key={index}>{course}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Academic Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {profileData.links.googleScholar && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={profileData.links.googleScholar} target="_blank" rel="noopener noreferrer">
                        Google Scholar
                      </a>
                    </Button>
                  )}
                  {profileData.links.researchGate && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={profileData.links.researchGate} target="_blank" rel="noopener noreferrer">
                        ResearchGate
                      </a>
                    </Button>
                  )}
                  {profileData.links.linkedin && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={profileData.links.linkedin} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {profileData.links.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={profileData.links.website} target="_blank" rel="noopener noreferrer">
                        Personal Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="materials" className="space-y-4">
              <TabsList>
                <TabsTrigger value="materials">Study Materials</TabsTrigger>
                <TabsTrigger value="blogs">Blogs & Announcements</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>
              <TabsContent value="materials">
                <ProfileStudyMaterials student={profileData} />
              </TabsContent>
              <TabsContent value="blogs">
                <ProfileBlogs student={profileData} />
              </TabsContent>
              <TabsContent value="events">
                <ProfileEvents student={profileData} />
              </TabsContent>
              <TabsContent value="appointments">
                <ProfileAppointments student={profileData} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
