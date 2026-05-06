"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Crown, Globe, Lock, Users, UserPlus } from "lucide-react"

interface ProfileStudyGroupsProps {
  student: any
  limit?: number
}

export function ProfileStudyGroups({ student, limit }: ProfileStudyGroupsProps) {
  const [groups, setGroups] = useState<any[]>([])

  const { status: sessionStatus } = useSession()

  useEffect(() => {
    let cancelled = false
    const fetchUserGroups = async () => {
      try {
        let joinedGroups: any[] = []
        if (sessionStatus === "authenticated") {
          const { groups } = await api.myGroups()
          joinedGroups = groups
        }

        if (cancelled) return

        if (joinedGroups.length === 0) {
          setGroups([
            {
              id: 1,
              name: "Cognitive Psychology Study Group",
              course: "PSY 201",
              subject: "Psychology",
              description: "Weekly study sessions focusing on cognitive psychology topics and exam preparation.",
              members: 12,
              visibility: "public",
              banner: "/placeholder.svg?height=100&width=300",
              tags: ["Cognitive", "Memory", "Attention"],
              created: "2 months ago",
              lastActive: "2 days ago",
              isAdmin: true,
              isMember: true,
              admins: [
                {
                  id: student.id,
                  name: student.name,
                  avatar: student.avatar,
                },
              ],
            },
            {
              id: 2,
              name: "Research Methods Collaboration",
              course: "PSY 300",
              subject: "Psychology",
              description: "Group for collaborating on research methods assignments and sharing resources.",
              members: 8,
              visibility: "private",
              banner: "/placeholder.svg?height=100&width=300",
              tags: ["Research", "Methods", "Statistics"],
              created: "3 months ago",
              lastActive: "1 week ago",
              isAdmin: false,
              isMember: true,
              admins: [
                {
                  id: "user123",
                  name: "Emily Parker",
                  avatar: "/placeholder.svg?height=32&width=32",
                },
              ],
            },
            {
              id: 3,
              name: "Neuroscience Discussion Group",
              course: "PSY 315",
              subject: "Psychology",
              description: "In-depth discussions on neuroscience topics and current research.",
              members: 15,
              visibility: "invite-only",
              banner: "/placeholder.svg?height=100&width=300",
              tags: ["Neuroscience", "Brain", "Neural Networks"],
              created: "1 month ago",
              lastActive: "3 days ago",
              isAdmin: false,
              isMember: true,
              admins: [
                {
                  id: "user456",
                  name: "Dr. Michael Chen",
                  avatar: "/placeholder.svg?height=32&width=32",
                },
              ],
            },
            {
              id: 4,
              name: "Psychology & Tech Intersection",
              course: "PSY 410",
              subject: "Psychology",
              description: "Exploring the intersection of psychology and technology, including AI applications.",
              members: 10,
              visibility: "public",
              banner: "/placeholder.svg?height=100&width=300",
              tags: ["Technology", "AI", "Digital Psychology"],
              created: "2 weeks ago",
              lastActive: "1 day ago",
              isAdmin: true,
              isMember: true,
              admins: [
                {
                  id: student.id,
                  name: student.name,
                  avatar: student.avatar,
                },
              ],
            },
          ])
        } else {
          const enrichedGroups = joinedGroups.map((group: any) => ({
            ...group,
            isAdmin: group.role === "admin",
            isMember: true,
            banner: group.banner || "/placeholder.svg?height=100&width=300",
            admins: [
              {
                id: "creator",
                name: group.creator || "Group Creator",
                avatar: group.creatorAvatar || "/placeholder.svg?height=32&width=32",
              },
            ],
          }))
          setGroups(enrichedGroups)
        }
      } catch (error) {
        console.error("Error fetching user groups:", error)
        setGroups([])
      }
    }

    fetchUserGroups()
    const handleCustomEvent = () => fetchUserGroups()
    window.addEventListener("gwStudyGroupsUpdated", handleCustomEvent)
    return () => {
      cancelled = true
      window.removeEventListener("gwStudyGroupsUpdated", handleCustomEvent)
    }
  }, [sessionStatus, student.id, student.name, student.avatar])

  const displayGroups = limit ? groups.slice(0, limit) : groups

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Users className="mr-2 h-5 w-5 text-[#0033A0]" />
          Study Groups
          <Badge className="ml-2">{groups.length}</Badge>
        </CardTitle>
        {limit && groups.length > limit && (
          <Link href={`/student/study-groups?user=${student.id}`}>
            <Button variant="ghost" className="h-8 w-8 p-0" title="View all study groups">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {displayGroups.length > 0 ? (
          <div className="space-y-4">
            {displayGroups.map((group) => (
              <Link key={group.id} href={`/student/study-groups/${group.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex">
                    <div className="relative h-24 w-24 bg-gray-100 flex-shrink-0">
                      {group.banner && (
                        <Image
                          src={group.banner || "/placeholder.svg"}
                          alt={group.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-semibold text-[#0033A0]">{group.name}</h3>
                            {group.visibility === "public" && (
                              <Globe className="h-3 w-3 text-green-500" title="Public Group" />
                            )}
                            {group.visibility === "private" && (
                              <Lock className="h-3 w-3 text-amber-500" title="Private Group" />
                            )}
                            {group.visibility === "invite-only" && (
                              <UserPlus className="h-3 w-3 text-blue-500" title="Invite Only" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {group.course} • {group.subject}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-1 mt-1">{group.description}</p>
                        </div>
                        {group.isAdmin && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50">
                            <Crown className="h-3 w-3 text-yellow-500" />
                            <span>Admin</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex space-x-1">
                          {group.tags &&
                            group.tags.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          {group.tags && group.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{group.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{group.members} members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {limit && groups.length > limit && (
              <div className="pt-2 text-center">
                <Link href={`/student/study-groups?user=${student.id}`}>
                  <Button variant="outline" size="sm">
                    View All ({groups.length}) Groups
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No study groups yet</p>
            <Link href="/student/study-groups">
              <Button variant="outline" size="sm" className="mt-4">
                Browse Study Groups
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
