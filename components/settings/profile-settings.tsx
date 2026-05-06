"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2 } from "lucide-react"
import { saveProfileImage } from "@/utils/image-upload"
import { api } from "@/lib/api-client"
import { useSession } from "next-auth/react"

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=100&width=100",
    email: "alex.johnson@gwu.edu",
    phone: "(202) 555-0123",
    program: "Psychology",
    year: "Class of 2025",
    bio: "Psychology student interested in cognitive development and research methods. Looking to connect with peers for study groups and research opportunities.",
    interests: "Cognitive Psychology, Child Development, Research Methods",
    pronouns: "they/them",
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
          name: profile.name ?? prev.name,
          email: profile.email ?? prev.email,
          avatar: profile.image ?? prev.avatar,
          program: profile.program ?? prev.program,
          year: profile.year ?? prev.year,
          bio: profile.bio ?? prev.bio,
          interests: Array.isArray(profile.interests)
            ? profile.interests.join(", ")
            : prev.interests,
        }))
      })
      .catch((err) => console.error("Error loading profile:", err))
    return () => {
      cancelled = true
    }
  }, [status])

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const imageUrl = await saveProfileImage(file)
      handleChange("avatar", imageUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        image: profileData.avatar,
        program: profileData.program,
        year: profileData.year,
        interests: profileData.interests
          ? profileData.interests.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
      })
      window.dispatchEvent(new Event("profileUpdated"))
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and how others see you on the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
              <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <Label
                htmlFor="avatar-upload"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Upload avatar</span>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Select
                  value={profileData.pronouns}
                  onValueChange={(value) => handleChange("pronouns", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="pronouns">
                    <SelectValue placeholder="Select pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="she/her">she/her</SelectItem>
                    <SelectItem value="he/him">he/him</SelectItem>
                    <SelectItem value="they/them">they/them</SelectItem>
                    <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="program">Program/Major</Label>
            <Input
              id="program"
              value={profileData.program}
              onChange={(e) => handleChange("program", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Graduation Year</Label>
            <Select
              value={profileData.year}
              onValueChange={(value) => handleChange("year", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class of 2024">Class of 2024</SelectItem>
                <SelectItem value="Class of 2025">Class of 2025</SelectItem>
                <SelectItem value="Class of 2026">Class of 2026</SelectItem>
                <SelectItem value="Class of 2027">Class of 2027</SelectItem>
                <SelectItem value="Class of 2028">Class of 2028</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            value={profileData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            disabled={isLoading}
            placeholder="Tell others about yourself..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interests</Label>
          <Textarea
            id="interests"
            rows={2}
            value={profileData.interests}
            onChange={(e) => handleChange("interests", e.target.value)}
            disabled={isLoading}
            placeholder="List your academic and personal interests..."
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}
