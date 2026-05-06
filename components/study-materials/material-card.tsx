"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BookOpen,
  Download,
  Edit,
  Eye,
  FileText,
  Flag,
  Heart,
  ImageIcon,
  MoreHorizontal,
  Presentation,
  Share2,
  Star,
  Trash,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"

interface MaterialCardProps {
  id?: string
  title?: string
  description?: string
  fileType?: string
  uploadDate?: string
  downloads?: number
  views?: number
  uploader?: {
    name: string
    avatar?: string
  }
  tags?: string[]
  rating?: number
  ratingCount?: number
  fileSize?: string
  isFavorite?: boolean
  isOwner?: boolean
  material?: any // For backward compatibility
}

export function MaterialCard(props: MaterialCardProps) {
  const router = useRouter()

  // Handle both patterns: either a material object or individual properties
  const material = props.material || props

  const id = material.id || "unknown"
  const title = material.title || "Untitled Material"
  const description = material.description || ""
  const fileType = material.fileType || "unknown"
  const uploadDate = material.uploadDate || "Unknown date"
  const downloads = material.downloads || 0
  const views = material.views || 0
  const uploader = material.uploader || { name: "Unknown User" }
  const tags = material.tags || []
  const rating = material.rating || 0
  const ratingCount = material.ratingCount || 0
  const fileSize = material.fileSize || "Unknown size"
  const isOwner = props.isOwner || false

  const [isFavorite, setIsFavorite] = useState(material.isFavorite || false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  // Server is the source of truth, but we'll keep a flag in component state.
  useEffect(() => {
    setIsFavorite(material.isFavorite || false)
  }, [material.isFavorite])

  const getFileIcon = (fileType: string | undefined) => {
    // Handle undefined or null fileType
    if (!fileType) {
      return <BookOpen className="h-10 w-10 text-gray-500" />
    }

    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-500" />
      case "docx":
      case "doc":
        return <FileText className="h-10 w-10 text-blue-500" />
      case "pptx":
      case "ppt":
        return <Presentation className="h-10 w-10 text-orange-500" />
      case "jpg":
      case "png":
      case "jpeg":
        return <ImageIcon className="h-10 w-10 text-green-500" />
      default:
        return <BookOpen className="h-10 w-10 text-gray-500" />
    }
  }

  const handleToggleFavorite = async () => {
    const next = !isFavorite
    setIsFavorite(next)
    try {
      const { favorite } = await api.toggleFavorite(id)
      setIsFavorite(favorite)
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      setIsFavorite(!next)
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.downloadMaterial(id)
      setIsDownloaded(true)
      alert(`Downloaded: ${title}`)
    } catch (err: any) {
      console.error("Download failed", err)
      alert(err?.message || "Download failed. Please sign in.")
    }
  }

  const handleCardClick = () => {
    router.push(`/student/study-materials/${id}`)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100">
            {getFileIcon(fileType)}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite()
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                {isOwner ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h3 className="font-semibold text-[#0033A0] hover:underline line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {tags &&
            tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={uploader?.avatar || "/placeholder.svg"} alt={uploader?.name || "User"} />
              <AvatarFallback>{uploader?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span>{uploader?.name || "Unknown User"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>
              {rating || "0"} ({ratingCount || "0"})
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-4">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs text-gray-500">{uploadDate}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className={`h-8 gap-1 ${isDownloaded ? "bg-green-600 hover:bg-green-700" : "bg-[#0033A0] hover:bg-[#002180]"}`}
                  onClick={(e) => handleDownload(e)}
                >
                  <Download className="h-3 w-3" />
                  {isDownloaded ? "Downloaded" : "Download"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {downloads} downloads • {fileSize}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  )
}
