"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BookOpen, Globe, Lock, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CreateStudyGroupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [course, setCourse] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [allowStudentPosts, setAllowStudentPosts] = useState(true)
  const [allowStudentUploads, setAllowStudentUploads] = useState(true)
  const [allowStudentEvents, setAllowStudentEvents] = useState(false)
  const [notifyDashboard, setNotifyDashboard] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!groupName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a name for your study group.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!course.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a course for your study group.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!subject.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a subject for your study group.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          course,
          subject,
          visibility,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          permissions: {
            allowMemberPosts: allowStudentPosts,
            allowMemberUploads: allowStudentUploads,
            allowMemberEvents: allowStudentEvents,
            notifyDashboard,
          },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create group")
      }
      const { group } = await res.json()
      window.dispatchEvent(new Event("gwStudyGroupsUpdated"))
      toast({
        title: "Study Group Created",
        description: "Your study group has been created successfully.",
      })
      router.push(`/faculty/study-groups/${group.id}`)
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "There was a problem creating your study group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center">
          <MainNav />
          <DashboardHeader role="faculty" />
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav role="faculty" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2">
              <Link href="/faculty/study-groups">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Groups
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Create Study Group</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Group Information</CardTitle>
                    <CardDescription>Provide details about your new study group</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Group Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Advanced Computer Science Concepts"
                        required
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the purpose and goals of your study group"
                        rows={4}
                        required
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <Input
                          id="course"
                          placeholder="e.g., CS 4500"
                          required
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Computer Science"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., Algorithms, Data Structures, Programming"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Group Image (optional)</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-24 rounded-md border-2 border-dashed flex items-center justify-center bg-gray-50">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <Button type="button" variant="outline">
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visibility & Access</CardTitle>
                    <CardDescription>Control who can join and view your group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-4">
                      <div className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="public" id="public" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="public" className="flex items-center gap-2 font-medium">
                            <Globe className="h-4 w-4 text-green-500" />
                            Public
                          </Label>
                          <p className="text-sm text-gray-500">
                            Anyone can find and join this group. All content is visible to members.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="private" id="private" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="private" className="flex items-center gap-2 font-medium">
                            <Lock className="h-4 w-4 text-amber-500" />
                            Private
                          </Label>
                          <p className="text-sm text-gray-500">
                            The group is visible in search but requires faculty approval to join.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="course-enrolled" id="course-enrolled" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="course-enrolled" className="flex items-center gap-2 font-medium">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Course-Enrolled Only
                          </Label>
                          <p className="text-sm text-gray-500">
                            Only students enrolled in the specified course can join this group.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Permissions & Settings</CardTitle>
                    <CardDescription>Configure what members can do in your group</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="allow-posts" checked={allowStudentPosts} onCheckedChange={setAllowStudentPosts} />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="allow-posts" className="font-medium">
                          Allow student posts
                        </Label>
                        <p className="text-sm text-gray-500">
                          Students can create posts and participate in discussions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="allow-uploads"
                        checked={allowStudentUploads}
                        onCheckedChange={setAllowStudentUploads}
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="allow-uploads" className="font-medium">
                          Allow student uploads
                        </Label>
                        <p className="text-sm text-gray-500">Students can upload and share study materials</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="allow-events"
                        checked={allowStudentEvents}
                        onCheckedChange={setAllowStudentEvents}
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="allow-events" className="font-medium">
                          Allow student events
                        </Label>
                        <p className="text-sm text-gray-500">Students can create and schedule group events</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="notify-dashboard" checked={notifyDashboard} onCheckedChange={setNotifyDashboard} />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="notify-dashboard" className="font-medium">
                          Show announcements on dashboard
                        </Label>
                        <p className="text-sm text-gray-500">
                          Important announcements will appear on student dashboards
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Co-Administrators</CardTitle>
                    <CardDescription>Add teaching assistants or other faculty as co-administrators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Search by name or email..." className="flex-1" />
                        <Button variant="outline" type="button">
                          Add
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        No co-administrators added yet. Co-administrators can help manage the group, approve members,
                        and moderate content.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Link href="/faculty/study-groups">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="bg-[#0033A0] hover:bg-[#002180]" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Study Group"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
