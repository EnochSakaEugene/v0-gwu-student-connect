"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlogEditor } from "@/components/blogs/blog-editor"
import { PollCreator } from "@/components/blogs/poll-creator"
import { TagSelector } from "@/components/blogs/tag-selector"
import { VisibilitySelector } from "@/components/blogs/visibility-selector"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function CreateBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState("public")
  const [postType, setPostType] = useState("article")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
  }

  const handleVisibilityChange = (newVisibility: string) => {
    setVisibility(newVisibility)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim() && postType === "article") {
      toast({
        title: "Error",
        description: "Please enter content for your article",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
          visibility,
          type: postType === "poll" ? "poll" : "article",
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to publish")
      }
      window.dispatchEvent(new Event("blogsUpdated"))
      toast({ title: "Success", description: "Your blog post has been published" })
      setTimeout(() => router.push("/student/blogs"), 800)
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast({
        title: "Error",
        description: "There was an error publishing your post. Please make sure you're signed in.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout role="student">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/student/blogs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Publishing..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title for your post"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-image">Cover Image (Optional)</Label>
                  <Input id="cover-image" type="file" accept="image/*" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="article" className="w-full" onValueChange={(value) => setPostType(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="article">Article</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
            </TabsList>
            <TabsContent value="article">
              <Card>
                <CardHeader>
                  <CardTitle>Write Your Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <BlogEditor onContentChange={handleContentChange} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="poll">
              <Card>
                <CardHeader>
                  <CardTitle>Create Poll</CardTitle>
                </CardHeader>
                <CardContent>
                  <PollCreator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibility Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <VisibilitySelector onVisibilityChange={handleVisibilityChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagSelector onTagsChange={handleTagsChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interaction Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-comments">Allow Comments</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="allow-comments" className="rounded border-gray-300" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-reactions">Allow Reactions</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="allow-reactions" className="rounded border-gray-300" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-sharing">Allow Sharing</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="allow-sharing" className="rounded border-gray-300" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
