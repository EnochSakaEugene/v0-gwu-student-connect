"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Filter,
  Plus,
  Search,
  Users,
  Calendar,
  BookOpen,
  Clock,
  ChevronDown,
  Lock,
  Globe,
  UserPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    api
      .listGroups()
      .then(({ groups }) => {
        if (!cancelled) setStudyGroups(groups)
      })
      .catch((err) => console.error("Failed to load groups", err))
    return () => {
      cancelled = true
    }
  }, [])

  // Filter study groups based on search query and filters
  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubject = subjectFilter === "all" || group.subject === subjectFilter
    const matchesVisibility = visibilityFilter === "all" || group.visibility === visibilityFilter

    return matchesSearch && matchesSubject && matchesVisibility
  })

  // Sort filtered groups
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === "recent") {
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
      return tb - ta
    } else if (sortBy === "members") {
      return (b.members ?? 0) - (a.members ?? 0)
    } else if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  // Get unique subjects for filter
  const subjects = Array.from(new Set(studyGroups.map((group) => group.subject)))

  const handleGroupClick = (groupId: string) => {
    router.push(`/student/study-groups/${groupId}`)
  }

  return (
    <PageLayout role="student">
      <div className="flex-1 space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Study Groups</h2>
          <Link href="/student/study-groups/create">
            <Button className="bg-[#0033A0] hover:bg-[#002180]">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="invite-only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>
                          Sort: {sortBy === "recent" ? "Most Recent" : sortBy === "members" ? "Most Members" : "A-Z"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem onClick={() => setSortBy("recent")}>
                      <Clock className="mr-2 h-4 w-4" />
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("members")}>
                      <Users className="mr-2 h-4 w-4" />
                      Most Members
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Alphabetical (A-Z)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map((group) => (
            <div key={group.id} onClick={() => handleGroupClick(group.id)} className="cursor-pointer">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#0033A0]">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.course}</p>
                      </div>
                      <div className="ml-2">
                        {group.visibility === "public" && (
                          <Globe className="h-4 w-4 text-green-500" title="Public Group" />
                        )}
                        {group.visibility === "private" && (
                          <Lock className="h-4 w-4 text-amber-500" title="Private Group" />
                        )}
                        {group.visibility === "invite-only" && (
                          <UserPlus className="h-4 w-4 text-blue-500" title="Invite Only" />
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{group.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {group.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{group.members} members</span>
                    </div>

                    {group.nextMeeting && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Next: {group.nextMeeting}</span>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={group.creatorAvatar || "/placeholder.svg"} alt={group.creator} />
                          <AvatarFallback>{group.creator.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">Created by {group.creator}</span>
                      </div>
                      <span className="text-xs text-gray-500">Active {group.lastActive}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No study groups found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters, or create a new study group.
            </p>
            <Link href="/student/study-groups/create">
              <Button className="mt-4 bg-[#0033A0] hover:bg-[#002180]">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
