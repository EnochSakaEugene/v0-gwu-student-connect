"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Lock, Plus, UserPlus, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CreateStudyGroupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    course: "",
    subject: "",
    visibility: "public",
    allowMemberPosts: true,
    allowMemberUploads: true,
    allowMemberEvents: false,
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVisibilityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, visibility: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags((prev) => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a name for your study group.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.course.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide a course for your study group.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.subject.trim()) {
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
          name: formData.name,
          description: formData.description,
          course: formData.course,
          subject: formData.subject,
          visibility: formData.visibility,
          tags,
          permissions: {
            allowMemberPosts: formData.allowMemberPosts,
            allowMemberUploads: formData.allowMemberUploads,
            allowMemberEvents: formData.allowMemberEvents,
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
      router.push(`/student/study-groups/${group.id}`)
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
    <PageLayout role="student">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/student/study-groups">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Groups
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Create Study Group</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter a name for your study group"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the purpose and goals of your study group"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      name="course"
                      placeholder="e.g., MATH 101"
                      value={formData.course}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g., Mathematics"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add tags (press Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={tags.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTag}
                      disabled={tags.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Add up to 5 tags to help others find your group</p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Group Visibility</Label>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={handleVisibilityChange}
                    className="mt-2 space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="public" className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-green-500" />
                          Public
                        </Label>
                        <p className="text-sm text-gray-500">
                          Anyone can find and join this group. All content is visible to everyone.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="private" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-amber-500" />
                          Private
                        </Label>
                        <p className="text-sm text-gray-500">
                          Anyone can find this group, but only members can see content. Membership requires approval.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="invite-only" id="invite-only" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="invite-only" className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2 text-blue-500" />
                          Invite Only
                        </Label>
                        <p className="text-sm text-gray-500">
                          Only invited users can join and see this group. It won't appear in search results.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-t pt-4">
                  <Label className="mb-2 block">Member Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowMemberPosts"
                        checked={formData.allowMemberPosts}
                        onCheckedChange={(checked) => handleCheckboxChange("allowMemberPosts", checked as boolean)}
                      />
                      <Label htmlFor="allowMemberPosts">Allow members to create posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowMemberUploads"
                        checked={formData.allowMemberUploads}
                        onCheckedChange={(checked) => handleCheckboxChange("allowMemberUploads", checked as boolean)}
                      />
                      <Label htmlFor="allowMemberUploads">Allow members to upload resources</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowMemberEvents"
                        checked={formData.allowMemberEvents}
                        onCheckedChange={(checked) => handleCheckboxChange("allowMemberEvents", checked as boolean)}
                      />
                      <Label htmlFor="allowMemberEvents">Allow members to create events</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link href="/student/study-groups">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="bg-[#0033A0] hover:bg-[#002180]" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Study Group"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
