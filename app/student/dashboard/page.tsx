"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { PageLayout } from "@/components/page-layout"
import { WelcomePanel } from "@/components/dashboard/welcome-panel"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ScheduleWidget } from "@/components/dashboard/schedule-widget"
import { StudyGroupPreview } from "@/components/dashboard/study-group-preview"
import { RecentMaterials } from "@/components/dashboard/recent-materials"
import { SuggestionsWidget } from "@/components/dashboard/suggestions-widget"

export default function StudentDashboardPage() {
  const { status } = useSession()
  const [userProfile, setUserProfile] = useState({
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    program: "Psychology",
    year: "Class of 2025",
  })

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api
      .myProfile()
      .then(({ profile }) => {
        if (cancelled) return
        setUserProfile((prev) => ({
          name: profile.name || prev.name,
          avatar: profile.image || prev.avatar,
          program: profile.program || prev.program,
          year: profile.year || prev.year,
        }))
      })
      .catch((err) => console.error("Error loading profile:", err))
    return () => {
      cancelled = true
    }
  }, [status])

  const dashboardStats = {
    courses: 5,
    assignmentsDue: 2,
    unreadMessages: 3,
  }

  return (
    <PageLayout role="student">
      <div className="space-y-6 py-6 px-4 md:px-6">
        <WelcomePanel student={userProfile} stats={dashboardStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <QuickActions />
            <StudyGroupPreview />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed />
            <RecentMaterials />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScheduleWidget />
          <SuggestionsWidget />
        </div>
      </div>
    </PageLayout>
  )
}
