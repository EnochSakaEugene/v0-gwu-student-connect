"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Mail, MessageSquare, MoreHorizontal, Share2, UserPlus, UserMinus, Save, X, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { handleImageUpload, saveProfileImage } from "@/utils/image-upload"

interface ProfileHeaderProps {
  student: {
    id: string
    name: string
    email: string
    gwid: string
    school: string
    program: string
    year: string
    interests: string[]
    status?: string
    avatar?: string
    isCurrentUser: boolean
  }
  onProfileUpdate?: (updatedProfile: any) => void
}

export function ProfileHeader({ student, onProfileUpdate }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [status, setStatus] = useState(student.status || "")
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(student.avatar || "/placeholder.svg")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for editable profile fields
  const [editableProfile, setEditableProfile] = useState({
    name: student.name,
    email: student.email,
    school: student.school,
    program: student.program,
    year: student.year,
    interests: [...student.interests],
  })

  // Available options for dropdowns
  const schools = [
    "College of Arts & Sciences",
    "School of Engineering & Applied Science",
    "School of Business",
    "School of Medicine & Health Sciences",
    "Law School",
    "Graduate School of Education & Human Development",
  ]

  const programs = {
    "College of Arts & Sciences": ["Psychology", "Biology", "Chemistry", "Political Science", "Economics", "History"],
    "School of Engineering & Applied Science": [
      "Computer Science",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Biomedical Engineering",
    ],
    "School of Business": ["Finance", "Marketing", "Management", "Accounting", "International Business"],
    "School of Medicine & Health Sciences": ["Medicine", "Public Health", "Physician Assistant", "Physical Therapy"],
    "Law School": ["Law"],
    "Graduate School of Education & Human Development": ["Education", "Counseling", "Human Development"],
  }

  const years = ["Class of 2024", "Class of 2025", "Class of 2026", "Class of 2027", "Graduate Student"]

  const interests = [
    "Research",
    "Academic Writing",
    "Data Analysis",
    "Programming",
    "Laboratory Work",
    "Public Speaking",
    "Group Projects",
    "Tutoring",
    "Volunteering",
    "Leadership",
    "Entrepreneurship",
    "Arts & Culture",
    "Sports & Fitness",
    "Sustainability",
    "Global Affairs",
    "Cognitive Psychology",
    "Research Methods",
    "Mental Health",
    "Data Science",
    "Artificial Intelligence",
    "Web Development",
  ]

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleStatusUpdate = () => {
    // In a real app, you would save the status to the database
    setIsEditing(false)
    if (onProfileUpdate) {
      onProfileUpdate({ ...student, status })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true)
      try {
        const imageUrl = await handleImageUpload(e.target.files[0])
        setAvatarSrc(imageUrl)
        saveProfileImage(imageUrl)

        // Update the student object with the new avatar
        if (onProfileUpdate) {
          onProfileUpdate({ ...student, avatar: imageUrl })
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      } finally {
        setIsUploading(false)
        setShowImageUpload(false)
      }
    }
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
  }

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false)
    // Reset to original values
    setEditableProfile({
      name: student.name,
      email: student.email,
      school: student.school,
      program: student.program,
      year: student.year,
      interests: [...student.interests],
    })
  }

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
    // In a real app, you would save the profile to the database
    if (onProfileUpdate) {
      onProfileUpdate({ ...student, ...editableProfile })
    }
  }

  const handleInterestToggle = (interest: string) => {
    setEditableProfile((prev) => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        }
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        }
      }
    })
  }

  useEffect(() => {
    // Hydrate avatar source whenever the parent passes a fresh student record.
    if (student.avatar) setAvatarSrc(student.avatar)
    const onUpdate = () => {
      // Other components may broadcast profile changes; re-render with whatever
      // the parent passes us next.
      if (student.avatar) setAvatarSrc(student.avatar)
    }
    window.addEventListener("profileUpdated", onUpdate)
    return () => window.removeEventListener("profileUpdated", onUpdate)
  }, [student.avatar])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white bg-white">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={student.name} />
                <AvatarFallback className="text-2xl">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {student.isCurrentUser && (
                <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-0 bottom-0 rounded-full p-1 h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture. The image should be square for best results.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowImageUpload(false)} disabled={isUploading}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#0033A0] hover:bg-[#002180]"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {!student.isCurrentUser && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleToggleFollow}>
                  {isFollowing ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button size="sm" className="bg-[#0033A0] hover:bg-[#002180]">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{isEditingProfile ? editableProfile.name : student.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Badge variant="outline">{isEditingProfile ? editableProfile.program : student.program}</Badge>
                  <span className="text-sm">{isEditingProfile ? editableProfile.year : student.year}</span>
                </div>
              </div>

              {!student.isCurrentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Report User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isEditingProfile ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEditProfile}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} className="bg-[#0033A0] hover:bg-[#002180]">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isEditing}>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEditProfile}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <Textarea
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleStatusUpdate} className="bg-[#0033A0] hover:bg-[#002180]">
                      Update
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-1">{status || "No status set"}</p>
              )}
            </div>

            {/* Basic Info */}
            {isEditingProfile ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editableProfile.name}
                      onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={editableProfile.email}
                      onChange={(e) => setEditableProfile({ ...editableProfile, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Select
                    value={editableProfile.school}
                    onValueChange={(value) => setEditableProfile({ ...editableProfile, school: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={editableProfile.program}
                    onValueChange={(value) => setEditableProfile({ ...editableProfile, program: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your program" />
                    </SelectTrigger>
                    <SelectContent>
                      {editableProfile.school &&
                        programs[editableProfile.school as keyof typeof programs]?.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={editableProfile.year}
                    onValueChange={(value) => setEditableProfile({ ...editableProfile, year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={editableProfile.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">GWID:</span>
                      <span>{student.gwid}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Academic Information</h3>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>
                      <span className="font-medium">School:</span> {student.school}
                    </div>
                    <div>
                      <span className="font-medium">Program:</span> {student.program}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> {student.year}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interests */}
            {!isEditingProfile && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Interests</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {student.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
