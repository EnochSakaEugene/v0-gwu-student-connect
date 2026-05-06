"use client"

import { api } from "@/lib/api-client"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeaturedBlogBanner } from "@/components/blogs/featured-blog-banner"
import { BlogCard } from "@/components/blogs/blog-card"
import { PollCard } from "@/components/blogs/poll-card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

// Mock data for featured blog
const featuredBlog = {
  id: "featured-1",
  title: "Tips for Effective Study Habits",
  excerpt:
    "Learn how to maximize your study time with these proven techniques that have helped me improve my grades and reduce stress during exam periods.",
  author: {
    name: "Jane Smith",
    role: "Student",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JS",
    major: "Psychology",
    year: "Junior",
  },
  date: "December 10, 2025",
  readTime: "5 min read",
  tags: ["Study Tips", "Productivity"],
  likes: 42,
  comments: 15,
  coverImage: "/images/student-studying.jpeg",
}

// Mock data for blogs
const initialBlogs = [
  {
    id: "blog-1",
    title: "Tips for Acing Your Finals",
    excerpt: "Here are some proven strategies that helped me prepare for and excel in my final exams last semester.",
    author: "Sarah Johnson",
    authorRole: "Computer Science",
    date: "2 days ago",
    commentCount: 12,
    likeCount: 45,
    tags: ["Study Tips", "Finals", "Productivity"],
    content: "Here are some proven strategies that helped me prepare for and excel in my final exams last semester...",
  },
  {
    id: "blog-2",
    title: "My Internship Experience at Google",
    excerpt:
      "I spent last summer as a software engineering intern at Google. Here's what I learned and how you can prepare for a similar opportunity.",
    author: "Michael Chen",
    authorRole: "Computer Science",
    date: "1 week ago",
    commentCount: 8,
    likeCount: 67,
    tags: ["Internships", "Career", "Tech"],
    content:
      "I spent last summer as a software engineering intern at Google. Here's what I learned and how you can prepare for a similar opportunity...",
  },
  {
    id: "blog-3",
    title: "Research Opportunities in Psychology",
    excerpt:
      "Looking to gain research experience in psychology? Here are some opportunities both on and off campus that you might not know about.",
    author: "Emily Rodriguez",
    authorRole: "Psychology",
    date: "3 days ago",
    commentCount: 5,
    likeCount: 23,
    tags: ["Research", "Psychology", "Opportunities"],
    content:
      "Looking to gain research experience in psychology? Here are some opportunities both on and off campus that you might not know about...",
  },
  {
    id: "blog-4",
    title: "Balancing Work and Study",
    excerpt:
      "As someone who works 20 hours a week while taking a full course load, here are my tips for maintaining balance and sanity.",
    author: "David Kim",
    authorRole: "Business Administration",
    date: "5 days ago",
    commentCount: 15,
    likeCount: 52,
    tags: ["Work-Life Balance", "Productivity", "Student Jobs"],
    content:
      "As someone who works 20 hours a week while taking a full course load, here are my tips for maintaining balance and sanity...",
  },
  {
    id: "blog-5",
    title: "Navigating Campus Resources",
    excerpt:
      "There are so many resources available on campus that many students don't know about. Here's my comprehensive guide.",
    author: "Jasmine Patel",
    authorRole: "Education",
    date: "1 day ago",
    commentCount: 3,
    likeCount: 19,
    tags: ["Campus Life", "Resources", "Student Services"],
    content:
      "There are so many resources available on campus that many students don't know about. Here's my comprehensive guide...",
  },
  {
    id: "blog-6",
    title: "Study Abroad: My Semester in Tokyo",
    excerpt:
      "From language barriers to cultural discoveries, here's everything about my transformative semester studying in Tokyo.",
    author: "Ryan Martinez",
    authorRole: "International Relations",
    date: "2 weeks ago",
    commentCount: 22,
    likeCount: 88,
    tags: ["Study Abroad", "Travel", "Japan"],
    content:
      "From language barriers to cultural discoveries, here's everything about my transformative semester studying in Tokyo...",
  },
]

// Mock data for polls
const polls = [
  {
    id: "poll-1",
    question: "What study method works best for you?",
    options: [
      { id: "1", text: "Flashcards", votes: 45 },
      { id: "2", text: "Practice tests", votes: 78 },
      { id: "3", text: "Study groups", votes: 32 },
      { id: "4", text: "Teaching others", votes: 24 },
    ],
    totalVotes: 179,
    author: "Academic Success Center",
    authorRole: "Campus Resource",
    date: "1 week ago",
    commentCount: 23,
  },
  {
    id: "poll-2",
    question: "Which campus dining option is your favorite?",
    options: [
      { id: "1", text: "Student Center Food Court", votes: 67 },
      { id: "2", text: "Residence Hall Cafeteria", votes: 23 },
      { id: "3", text: "Campus Café", votes: 89 },
      { id: "4", text: "Food Trucks", votes: 52 },
    ],
    totalVotes: 231,
    author: "Student Life Committee",
    authorRole: "Campus Organization",
    date: "3 days ago",
    commentCount: 41,
  },
  {
    id: "poll-3",
    question: "How many hours do you study per week?",
    options: [
      { id: "1", text: "0-5 hours", votes: 34 },
      { id: "2", text: "6-10 hours", votes: 56 },
      { id: "3", text: "11-20 hours", votes: 87 },
      { id: "4", text: "21+ hours", votes: 43 },
    ],
    totalVotes: 220,
    author: "Department of Psychology",
    authorRole: "Research Study",
    date: "2 weeks ago",
    commentCount: 18,
  },
]

export default function StudentBlogsPage() {
  // Client component wrapper
  function BlogsContent() {
    const [blogs, setBlogs] = useState<any[]>([])

    const loadBlogs = async () => {
      try {
        const { blogs } = await api.listBlogs()
        setBlogs(blogs.length ? blogs : initialBlogs)
      } catch (err) {
        console.error("Failed to load blogs", err)
        setBlogs(initialBlogs)
      }
    }

    useEffect(() => {
      loadBlogs()
      const handleBlogUpdate = () => loadBlogs()
      window.addEventListener("blogsUpdated", handleBlogUpdate)
      return () => window.removeEventListener("blogsUpdated", handleBlogUpdate)
    }, [])

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Blogs & Discussions</h1>
          <Button asChild>
            <Link href="/student/blogs/create">
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Link>
          </Button>
        </div>

        <FeaturedBlogBanner blog={featuredBlog} />

        <Tabs defaultValue="all" className="mt-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="polls">Polls</TabsTrigger>
            </TabsList>
            <Link href="/student/blogs/feed" className="text-sm text-blue-600 hover:underline">
              View Feed
            </Link>
          </div>

          <TabsContent value="all" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  id={blog.id}
                  title={blog.title}
                  excerpt={blog.excerpt}
                  author={blog.author}
                  authorRole={blog.authorRole}
                  date={blog.date}
                  commentCount={blog.commentCount}
                  likeCount={blog.likeCount}
                  tags={blog.tags}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BlogCard
                id="7"
                title="Advanced Machine Learning Techniques"
                excerpt="A deep dive into the latest ML techniques I've been experimenting with in my research lab."
                author="Prof. James Wilson"
                authorRole="Computer Science"
                date="3 days ago"
                commentCount={7}
                likeCount={31}
                tags={["Machine Learning", "AI", "Research"]}
              />
              <BlogCard
                id="8"
                title="Preparing for Graduate School Applications"
                excerpt="Having just gone through the process, here's my advice for those planning to apply to graduate programs next year."
                author="Sophia Lee"
                authorRole="Biology"
                date="1 week ago"
                commentCount={14}
                likeCount={42}
                tags={["Grad School", "Applications", "Career Planning"]}
              />
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BlogCard
                id="9"
                title="The Ultimate Guide to Campus Coffee Shops"
                excerpt="I visited every coffee shop on and around campus to find the best study spots, strongest coffee, and best value."
                author="Alex Thompson"
                authorRole="Journalism"
                date="2 weeks ago"
                commentCount={47}
                likeCount={156}
                tags={["Campus Life", "Coffee", "Study Spots"]}
              />
              <BlogCard
                id="10"
                title="How I Landed 5 Job Offers Before Graduation"
                excerpt="My strategic approach to internships, networking, and skill development that led to multiple job offers in my senior year."
                author="Daniel Park"
                authorRole="Finance"
                date="3 weeks ago"
                commentCount={35}
                likeCount={124}
                tags={["Career", "Job Search", "Networking"]}
              />
              <BlogCard
                id="11"
                title="Mental Health Resources Every Student Should Know"
                excerpt="From personal experience, these are the campus and online resources that helped me manage stress and anxiety during college."
                author="Olivia Garcia"
                authorRole="Psychology"
                date="1 month ago"
                commentCount={29}
                likeCount={118}
                tags={["Mental Health", "Wellness", "Self-Care"]}
              />
            </div>
          </TabsContent>

          <TabsContent value="polls" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  id={poll.id}
                  question={poll.question}
                  options={poll.options}
                  totalVotes={poll.totalVotes}
                  author={poll.author}
                  authorRole={poll.authorRole}
                  date={poll.date}
                  commentCount={poll.commentCount}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </>
    )
  }

  return (
    <PageLayout role="student">
      <BlogsContent />
    </PageLayout>
  )
}
