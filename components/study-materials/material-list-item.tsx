"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Eye, FileText, Heart, ImageIcon, Presentation, BookOpen } from "lucide-react"
import { api } from "@/lib/api-client"

interface MaterialListItemProps {
  id: string
  title: string
  description: string
  fileType: string
  uploadDate: string
  downloads: number
  views: number
  uploader: {
    name: string
    avatar?: string
  }
  tags: string[]
}

export function MaterialListItem({
  id,
  title,
  description,
  fileType,
  uploadDate,
  downloads,
  views,
  uploader,
  tags,
}: MaterialListItemProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "pptx":
      case "ppt":
        return <Presentation className="h-8 w-8 text-orange-500" />
      case "jpg":
      case "png":
      case "jpeg":
        return <ImageIcon className="h-8 w-8 text-green-500" />
      default:
        return <BookOpen className="h-8 w-8 text-gray-500" />
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
      console.error(err)
      alert(err?.message || "Download failed. Please sign in.")
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !isFavorite
    setIsFavorite(next)
    try {
      const { favorite } = await api.toggleFavorite(id)
      setIsFavorite(favorite)
    } catch (err) {
      console.error(err)
      setIsFavorite(!next)
    }
  }

  return (
    <Link href={`/student/study-materials/${id}`}>
      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100">{getFileIcon(fileType)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{description}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2} more
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Avatar className="h-5 w-5">
              <AvatarImage src={uploader.avatar || "/placeholder.svg"} alt={uploader.name} />
              <AvatarFallback>{uploader.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{uploader.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-3 w-3" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="h-3 w-3" />
            <span>{downloads}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDownload}
              aria-label="Download material"
            >
              <Download className={`h-4 w-4 ${isDownloaded ? "text-green-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
