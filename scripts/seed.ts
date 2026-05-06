/**
 * Seed script. Populates the Neon database with the demo content that used to
 * live in localStorage. Run after `pnpm db:push`:
 *
 *   pnpm db:seed
 *
 * It creates:
 *   - 3 demo users (student, faculty, alumni) with password `password123`
 *   - The five featured events from the original mock data
 *   - A handful of seed blogs and study groups
 *   - A handful of study materials
 *
 * Re-running is safe: each row check uses `onConflictDoNothing()` or is
 * skipped if it already exists by email/title.
 */

import "dotenv/config"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import {
  blogs,
  events,
  studyGroupMembers,
  studyGroups,
  studyMaterials,
  users,
} from "@/lib/db/schema"

async function ensureUser(payload: {
  email: string
  name: string
  role: "student" | "faculty" | "alumni"
  program?: string
  year?: string
  department?: string
  position?: string
}) {
  const existing = await db.select().from(users).where(eq(users.email, payload.email)).limit(1)
  if (existing.length) return existing[0]
  const passwordHash = await bcrypt.hash("password123", 10)
  const [created] = await db
    .insert(users)
    .values({
      ...payload,
      passwordHash,
      image: "/placeholder.svg?height=128&width=128",
    })
    .returning()
  console.log(`  + user ${payload.email} (${payload.role})`)
  return created
}

async function main() {
  console.log("Seeding database...")

  const student = await ensureUser({
    email: "alex.johnson@gwconnect.edu",
    name: "Alex Johnson",
    role: "student",
    program: "Psychology",
    year: "Class of 2025",
  })
  const faculty = await ensureUser({
    email: "sarah.johnson@gwu.edu",
    name: "Dr. Sarah Johnson",
    role: "faculty",
    department: "Computer Science",
    position: "Associate Professor",
  })
  const alum = await ensureUser({
    email: "jordan.alum@gwconnect.edu",
    name: "Jordan Lee",
    role: "alumni",
  })

  // Events ----------------------------------------------------------------
  const seedEvents = [
    {
      title: "Career Fair: Tech & Engineering",
      date: "December 15, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Marvin Center Grand Ballroom",
      category: "Career",
      description:
        "Connect with over 50 employers from various industries looking to hire GW students and alumni.",
      isFeatured: true,
      attendees: 245,
      image: "/images/unknown.png",
    },
    {
      title: "Research Symposium: Undergraduate Projects",
      date: "December 20, 2025",
      time: "1:00 PM - 5:00 PM",
      location: "Science & Engineering Hall",
      category: "Academic",
      description:
        "Showcase your research at the annual Undergraduate Research Symposium.",
      isFeatured: true,
      attendees: 120,
      image: "/images/unknown-2.png",
    },
    {
      title: "Alumni Networking Event",
      date: "January 5, 2026",
      time: "6:00 PM - 8:00 PM",
      location: "University Hall",
      category: "Networking",
      description: "Connect with GW alumni from various industries.",
      attendees: 85,
    },
    {
      title: "Workshop: Resume Building & Interview Skills",
      date: "December 18, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Virtual (Zoom)",
      category: "Career",
      description:
        "Learn how to create a standout resume and ace your interviews with tips from career services professionals.",
      attendees: 62,
    },
    {
      title: "Student Organization Fair",
      date: "December 25, 2025",
      time: "11:00 AM - 3:00 PM",
      location: "Kogan Plaza",
      category: "Clubs",
      description: "Explore the diverse range of student organizations at GW.",
      attendees: 180,
    },
  ]

  for (const ev of seedEvents) {
    const existing = await db.select().from(events).where(eq(events.title, ev.title)).limit(1)
    if (existing.length) continue
    await db.insert(events).values({ ...ev, organizerId: faculty.id })
    console.log(`  + event ${ev.title}`)
  }

  // Blogs -----------------------------------------------------------------
  const seedBlogs = [
    {
      authorId: student.id,
      title: "Tips for Acing Your Finals",
      excerpt:
        "Here are some proven strategies that helped me prepare for and excel in my final exams last semester.",
      content:
        "Here are some proven strategies that helped me prepare for and excel in my final exams last semester. Start early, build a study schedule, and practice with old exams.",
      tags: ["Study Tips", "Finals", "Productivity"],
    },
    {
      authorId: alum.id,
      title: "My Internship Experience at Google",
      excerpt:
        "I spent last summer as a software engineering intern at Google. Here's what I learned and how you can prepare.",
      content:
        "I spent last summer as a software engineering intern at Google. Here's what I learned and how you can prepare for a similar opportunity.",
      tags: ["Internships", "Career", "Tech"],
    },
    {
      authorId: faculty.id,
      title: "Research Opportunities in Psychology",
      excerpt:
        "Looking to gain research experience in psychology? Here are some opportunities both on and off campus.",
      content:
        "Looking to gain research experience in psychology? Here are some opportunities both on and off campus that you might not know about.",
      tags: ["Research", "Psychology", "Opportunities"],
    },
  ]

  for (const b of seedBlogs) {
    const existing = await db.select().from(blogs).where(eq(blogs.title, b.title)).limit(1)
    if (existing.length) continue
    await db.insert(blogs).values(b as any)
    console.log(`  + blog ${b.title}`)
  }

  // Study groups ----------------------------------------------------------
  const seedGroups = [
    {
      name: "Calculus II Study Group",
      description: "Collaborate on problem sets and prepare for exams.",
      course: "MATH 220",
      subject: "Mathematics",
      tags: ["Calculus", "Mathematics", "Problem Sets"],
      creatorId: student.id,
    },
    {
      name: "Computer Science Fundamentals",
      description: "Discussing algorithms, data structures, and programming concepts.",
      course: "CS 101",
      subject: "Computer Science",
      tags: ["Programming", "Algorithms"],
      creatorId: faculty.id,
    },
    {
      name: "Psychology Study Group",
      description: "Reviewing concepts and preparing for exams in Intro to Psychology.",
      course: "PSYC 101",
      subject: "Psychology",
      tags: ["Psychology", "Exam Prep"],
      creatorId: student.id,
    },
  ]

  for (const g of seedGroups) {
    const existing = await db.select().from(studyGroups).where(eq(studyGroups.name, g.name)).limit(1)
    if (existing.length) continue
    const [created] = await db.insert(studyGroups).values(g as any).returning()
    await db.insert(studyGroupMembers).values({ groupId: created.id, userId: g.creatorId, role: "admin" })
    console.log(`  + group ${g.name}`)
  }

  // Study materials -------------------------------------------------------
  const seedMaterials = [
    {
      title: "Calculus I Final Exam Study Guide",
      description: "Comprehensive review of all topics covered in Calculus I.",
      fileType: "pdf",
      fileSize: "2.4 MB",
      tags: ["Calculus", "Final Exam", "Study Guide", "Mathematics"],
      uploaderId: student.id,
      rating: 48,
      ratingCount: 24,
      views: 342,
      downloads: 156,
    },
    {
      title: "Computer Science Data Structures Cheat Sheet",
      description: "Quick reference guide for common data structures.",
      fileType: "pdf",
      fileSize: "1.5 MB",
      tags: ["Computer Science", "Data Structures", "Cheat Sheet"],
      uploaderId: faculty.id,
      rating: 49,
      ratingCount: 32,
      views: 378,
      downloads: 215,
    },
  ]

  for (const m of seedMaterials) {
    const existing = await db.select().from(studyMaterials).where(eq(studyMaterials.title, m.title)).limit(1)
    if (existing.length) continue
    await db.insert(studyMaterials).values(m as any)
    console.log(`  + material ${m.title}`)
  }

  console.log("Seed complete.")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
