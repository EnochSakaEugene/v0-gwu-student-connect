"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  Heart,
  ImageIcon,
  Presentation,
  Share2,
  Star,
  Users,
  Clock,
  CheckCircle,
  Flag,
} from "lucide-react"
import { MaterialComments } from "@/components/study-materials/material-comments"
import { MaterialVersionHistory } from "@/components/study-materials/material-version-history"

export default function StudyMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("preview")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  // Mock data for the study material
  const material = {
    id: params.id,
    title: "Calculus I Final Exam Study Guide",
    description:
      "Comprehensive review of all topics covered in Calculus I, including limits, derivatives, and integrals. This guide includes practice problems, key formulas, and step-by-step solutions to help you prepare for the final exam.",
    course: "MATH 1231",
    subject: "Mathematics",
    fileType: "pdf",
    fileSize: "2.4 MB",
    uploadDate: "December 10, 2025",
    downloads: 156,
    views: 342,
    rating: 4.8,
    ratingCount: 32,
    comments: 15,
    uploader: {
      id: "1",
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Student",
      department: "Mathematics",
    },
    tags: ["Calculus", "Final Exam", "Study Guide", "Practice Problems"],
    isFavorite: false,
    isVerified: true,
    hasSolutions: true,
    hasVersions: true,
    versions: [
      {
        version: "3",
        date: "December 10, 2025",
        notes: "Added more practice problems and solutions",
        isCurrent: true,
      },
      {
        version: "2",
        date: "December 5, 2025",
        notes: "Updated formulas and fixed typos",
      },
      {
        version: "1",
        date: "December 1, 2025",
        notes: "Initial version",
      },
    ],
    relatedMaterials: [
      {
        id: "2",
        title: "Calculus I Midterm Study Guide",
        course: "MATH 1231",
        downloads: 124,
      },
      {
        id: "3",
        title: "Calculus I Formula Sheet",
        course: "MATH 1231",
        downloads: 210,
      },
      {
        id: "4",
        title: "Calculus II Preview",
        course: "MATH 1232",
        downloads: 98,
      },
    ],
    studyGroups: [
      {
        id: "sg1",
        name: "Calculus Study Group",
        members: 12,
      },
      {
        id: "sg2",
        name: "Math Majors Club",
        members: 28,
      },
    ],
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-12 w-12 text-red-500" />
      case "docx":
        return <FileText className="h-12 w-12 text-blue-500" />
      case "pptx":
        return <Presentation className="h-12 w-12 text-orange-500" />
      case "jpg":
      case "png":
        return <ImageIcon className="h-12 w-12 text-green-500" />
      default:
        return <BookOpen className="h-12 w-12 text-gray-500" />
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/study-materials/${material.id}/download`, { method: "POST" })
      if (!res.ok) throw new Error("Download failed")
      setIsDownloaded(true)
      alert(`Downloaded: ${material.title}`)
    } catch (err) {
      console.error(err)
      alert("Could not record the download. Please sign in and try again.")
    }
  }

  const handleToggleFavorite = async () => {
    const next = !isFavorite
    setIsFavorite(next)
    try {
      const res = await fetch(`/api/study-materials/${material.id}/favorite`, { method: "POST" })
      if (!res.ok) throw new Error("Favorite failed")
      const { favorite } = await res.json()
      setIsFavorite(favorite)
    } catch (err) {
      console.error(err)
      setIsFavorite(!next)
    }
  }

  return (
    <PageLayout role="student" showNavInHeader={true}>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{material.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-gray-100">
                      {getFileIcon(material.fileType)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{material.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge>{material.course}</Badge>
                        <Badge variant="outline">{material.fileType.toUpperCase()}</Badge>
                        <Badge variant="outline">{material.fileSize}</Badge>
                        {material.isVerified && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {material.hasSolutions && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Solutions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
                      <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      {isFavorite ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" className="bg-[#0033A0] hover:bg-[#002180]" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{material.description}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {material.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={material.uploader.avatar || "/placeholder.svg"} alt={material.uploader.name} />
                      <AvatarFallback>{material.uploader.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{material.uploader.name}</p>
                      <p className="text-xs text-gray-500">
                        {material.uploader.role} • {material.uploader.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Uploaded on {material.uploadDate}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#0033A0]">{material.downloads}</p>
                    <p className="text-sm text-gray-500">Downloads</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0033A0]">{material.views}</p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold text-[#0033A0] ml-1">{material.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{material.ratingCount} Ratings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0033A0]">{material.comments}</p>
                    <p className="text-sm text-gray-500">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="versions">Version History</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-[16/9] bg-gray-100 rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                        <p className="mt-2 font-medium">Preview not available</p>
                        <p className="text-sm text-gray-500">Download the file to view its contents</p>
                        <Button className="mt-4 bg-[#0033A0] hover:bg-[#002180]" onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-1" />
                          Download Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="comments" className="mt-4">
                <MaterialComments materialId={material.id} />
              </TabsContent>
              <TabsContent value="versions" className="mt-4">
                <MaterialVersionHistory versions={material.versions} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Related Materials</h3>
                <div className="space-y-3">
                  {material.relatedMaterials.map((related) => (
                    <div key={related.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{related.title}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Badge variant="outline" className="mr-2">
                            {related.course}
                          </Badge>
                          <Download className="h-3 w-3 mr-1" />
                          {related.downloads}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Shared in Study Groups</h3>
                <div className="space-y-3">
                  {material.studyGroups.map((group) => (
                    <div key={group.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100">
                        <Users className="h-5 w-5 text-[#0033A0]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.members} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Last updated {material.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>Viewed 12 times this week</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-gray-500" />
                    <span>Downloaded 5 times this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Flag className="h-4 w-4 mr-2" />
                    Report this material
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </PageLayout>
  )
}
