"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudyGroupHeader } from "@/components/study-groups/study-group-header"
import { StudyGroupChat } from "@/components/study-groups/study-group-chat"
import { StudyGroupMembers } from "@/components/study-groups/study-group-members"
import { StudyGroupMeetings } from "@/components/study-groups/study-group-meetings"
import { StudyGroupResources } from "@/components/study-groups/study-group-resources"
import { StudyGroupCollaboration } from "@/components/study-groups/study-group-collaboration"
import { StudyGroupAnnouncements } from "@/components/study-groups/study-group-announcements"
import { StudyGroupPolls } from "@/components/study-groups/study-group-polls"
import { StudyGroupSettings } from "@/components/study-groups/study-group-settings"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"

export default function StudyGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("announcements")
  const [isMember, setIsMember] = useState(false)
  const [isFollowingCreator, setIsFollowingCreator] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const tabParam = urlParams.get("tab")
        if (tabParam) setActiveTab(tabParam)

        const { group: foundGroup } = await api.getGroup(params.id)
        if (!foundGroup) throw new Error("not-found")

        const enrichedGroup = {
          ...foundGroup,
          creator: foundGroup.creatorName,
          creatorAvatar: foundGroup.creatorImage,
          banner: foundGroup.banner || "/placeholder.svg?height=200&width=800",
          admins: [
            {
              id: foundGroup.creatorId,
              name: foundGroup.creatorName || "Group Creator",
              avatar: foundGroup.creatorImage || "/placeholder.svg?height=40&width=40",
            },
          ],
        }

        setGroup(enrichedGroup)
        setIsMember(!!foundGroup.isMember)

        if (foundGroup.creatorId) {
          try {
            const { following } = await api.isFollowing(foundGroup.creatorId)
            setIsFollowingCreator(following)
          } catch {
            setIsFollowingCreator(false)
          }
        }
      } catch (error: any) {
        console.error("Error fetching group:", error)
        toast({
          title: "Study Group Not Found",
          description: "The requested study group could not be found.",
          variant: "destructive",
        })
        router.push("/student/study-groups")
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [params.id, router])

  const handleJoinGroup = async () => {
    try {
      await api.joinGroup(params.id)
      setIsMember(true)
      toast({ title: "Joined Study Group", description: `You have successfully joined "${group.name}".` })
    } catch (err: any) {
      toast({ title: "Could not join", description: err.message ?? "Please sign in first.", variant: "destructive" })
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await api.leaveGroup(params.id)
      setIsMember(false)
      toast({ title: "Left Study Group", description: `You have left "${group.name}".` })
    } catch (err: any) {
      toast({ title: "Could not leave", description: err.message ?? "Try again.", variant: "destructive" })
    }
  }

  const handleFollowCreator = async () => {
    if (!group?.creatorId) return
    try {
      await api.follow(group.creatorId)
      setIsFollowingCreator(true)
      toast({ title: "Following User", description: `You are now following ${group.creator}.` })
    } catch (err: any) {
      toast({ title: "Could not follow", description: err.message ?? "Try again.", variant: "destructive" })
    }
  }

  const handleUnfollowCreator = async () => {
    if (!group?.creatorId) return
    try {
      await api.unfollow(group.creatorId)
      setIsFollowingCreator(false)
      toast({ title: "Unfollowed User", description: `You have unfollowed ${group.creator}.` })
    } catch (err: any) {
      toast({ title: "Could not unfollow", description: err.message ?? "Try again.", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <PageLayout role="student">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0033A0]" />
            <p className="mt-2 text-gray-500">Loading study group...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!group) {
    return (
      <PageLayout role="student">
        <div className="flex-1 p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Study Group Not Found</h2>
            <p className="mt-2 text-gray-500">The requested study group could not be found.</p>
            <Link href="/student/study-groups">
              <Button className="mt-4 bg-[#0033A0] hover:bg-[#002180]">Back to Study Groups</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout role="student">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/student/study-groups">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
        </div>

        <StudyGroupHeader
          group={{ ...group, isMember }}
          onJoin={handleJoinGroup}
          onLeave={handleLeaveGroup}
          onFollowCreator={handleFollowCreator}
          onUnfollowCreator={handleUnfollowCreator}
          isFollowingCreator={isFollowingCreator}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-start border-b pb-px overflow-auto">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {isMember && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>
          <TabsContent value="announcements" className="mt-6">
            <StudyGroupAnnouncements groupId={params.id} isMember={isMember} />
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            {isMember ? (
              <StudyGroupChat groupId={params.id} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium">Join to Access Chat</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You need to be a member of this study group to access the chat.
                </p>
                <Button className="mt-4 bg-[#0033A0] hover:bg-[#002180]" onClick={handleJoinGroup}>
                  Join Group
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="resources" className="mt-6">
            <StudyGroupResources groupId={params.id} isMember={isMember} />
          </TabsContent>
          <TabsContent value="meetings" className="mt-6">
            <StudyGroupMeetings groupId={params.id} isMember={isMember} />
          </TabsContent>
          <TabsContent value="collaboration" className="mt-6">
            {isMember ? (
              <StudyGroupCollaboration groupId={params.id} />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium">Join to Access Collaboration Tools</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You need to be a member of this study group to access collaboration tools.
                </p>
                <Button className="mt-4 bg-[#0033A0] hover:bg-[#002180]" onClick={handleJoinGroup}>
                  Join Group
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="polls" className="mt-6">
            <StudyGroupPolls groupId={params.id} isMember={isMember} />
          </TabsContent>
          <TabsContent value="members" className="mt-6">
            <StudyGroupMembers groupId={params.id} />
          </TabsContent>
          {isMember && (
            <TabsContent value="settings" className="mt-6">
              <StudyGroupSettings groupId={params.id} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  )
}
