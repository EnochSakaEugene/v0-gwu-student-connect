"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User, CalendarDays, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface DashboardHeaderProps {
  role: "student" | "faculty" | "alumni"
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
  })
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "message",
      name: "Chad",
      message: "Sent you a new message",
      time: "9:00 AM",
      avatar: "https://avatars.githubusercontent.com/u/4470490?v=4",
      read: false,
    },
    {
      id: "2",
      type: "event",
      name: "Career Fair: Tech & Engineering",
      message: "Event starts tomorrow",
      time: "10:00 AM",
      read: false,
    },
    {
      id: "3",
      type: "appointment",
      name: "Prof. Williams",
      message: "Confirmed your appointment request",
      time: "Yesterday",
      avatar: "/placeholder.svg?height=40&width=40",
      read: true,
    },
    {
      id: "4",
      type: "message",
      name: "Molly",
      message: "Replied to your study group question",
      time: "Yesterday",
      avatar: "https://avatars.githubusercontent.com/u/4470490?v=4",
      read: true,
    },
    {
      id: "5",
      type: "event",
      name: "Research Symposium",
      message: "You're marked as attending",
      time: "2 days ago",
      read: true,
    },
  ])
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const { status } = useSession()

  useEffect(() => {
    if (status !== "authenticated") return
    const loadProfileData = async () => {
      try {
        const { profile } = await api.myProfile()
        setProfileData({
          name: profile.name || "Member",
          avatar: profile.image || "/placeholder.svg?height=40&width=40",
        })
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
    loadProfileData()
    const handleCustomEvent = () => loadProfileData()
    window.addEventListener("profileUpdated", handleCustomEvent)
    return () => {
      window.removeEventListener("profileUpdated", handleCustomEvent)
    }
  }, [status])

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-semibold">Notifications</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 border-b last:border-0",
                      notification.read ? "bg-white" : "bg-blue-50",
                    )}
                  >
                    {notification.type === "message" && (
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} alt="" />
                        <AvatarFallback>{notification.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    {notification.type === "event" && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <CalendarDays className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {notification.type === "appointment" && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.name}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm">{notification.message}</p>
                      {notification.type === "message" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#0033A0]" asChild>
                          <Link href="/student/messages">Reply</Link>
                        </Button>
                      )}
                      {notification.type === "event" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#0033A0]" asChild>
                          <Link href="/student/events">View event</Link>
                        </Button>
                      )}
                      {notification.type === "appointment" && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#0033A0]" asChild>
                          <Link href="/student/appointments">View appointment</Link>
                        </Button>
                      )}
                    </div>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                  </div>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            )}
          </div>
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <Link href="/notifications">View all notifications</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
              <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profileData.name}</p>
              <p className="text-xs leading-none text-muted-foreground">student@gwu.edu</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/${role}/profile`}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${role}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
