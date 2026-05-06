"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BlogComments } from "@/components/blogs/blog-comments"
import { RelatedPosts } from "@/components/blogs/related-posts"
import { ArrowLeft, ThumbsUp, MessageSquare, Share2, Bookmark, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorRole: string
  date: string
  commentCount: number
  likeCount: number
  tags: string[]
  coverImage?: string
}

export default function BlogPost({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${params.id}`, { cache: "no-store" })
        if (res.ok) {
          const { blog } = await res.json()
          setBlog(blog)
        } else if (res.status === 404) {
          toast({
            title: "Blog not found",
            description: "The blog post you're looking for doesn't exist.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/student/blogs"), 2000)
        } else {
          throw new Error(`Request failed: ${res.status}`)
        }
      } catch (error) {
        console.error("Error fetching blog:", error)
        toast({
          title: "Error",
          description: "There was an error loading the blog post.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [params.id, router])

  if (loading) {
    return (
      <PageLayout role="student">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                <Skeleton className="h-[300px] w-full" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-10 w-3/4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  if (!blog) {
    return (
      <PageLayout role="student">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Blog post not found</h2>
            <p className="text-gray-500 mt-2">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => router.push("/student/blogs")}>
              Return to Blogs
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout role="student">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/student/blogs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {blog.coverImage && (
                <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6">
                  <img
                    src={blog.coverImage || "/placeholder.svg?height=400&width=800"}
                    alt={blog.title}
                    className="w-full h-[300px] object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {blog.tags &&
                  blog.tags.map((tag) => (
                    <Link href={`/student/blogs/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`} key={tag}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
              </div>

              <h1 className="text-3xl font-bold text-[#0033A0]">{blog.title}</h1>

              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={blog.author} />
                  <AvatarFallback>
                    {blog.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/student/profile/${blog.author.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="font-medium hover:underline cursor-pointer">{blog.author}</div>
                  </Link>
                  <div className="text-sm text-gray-500">
                    {blog.authorRole} • {blog.date}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {Math.ceil(blog.content.length / 1000)} min read
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {Math.floor(Math.random() * 200) + 50} views
                </div>
              </div>

              <Separator />

              <div className="prose max-w-none whitespace-pre-wrap">{blog.content}</div>

              <Separator />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{blog.likeCount}</span>
                  </Button>

                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{blog.commentCount}</span>
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                    <span className="ml-2">Share</span>
                  </Button>

                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                    <span className="ml-2">Save</span>
                  </Button>
                </div>
              </div>

              <BlogComments blogId={blog.id} commentCount={blog.commentCount} />
            </div>
          </CardContent>
        </Card>

        <RelatedPosts currentBlogId={blog.id} tags={blog.tags} />
      </div>
    </PageLayout>
  )
}
