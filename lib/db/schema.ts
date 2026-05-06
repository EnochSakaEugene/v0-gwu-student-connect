import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["student", "faculty", "alumni"])
export const eventStatusEnum = pgEnum("event_status", ["going", "maybe", "not-going"])
export const visibilityEnum = pgEnum("visibility", ["public", "private", "invite-only"])
export const blogTypeEnum = pgEnum("blog_type", ["article", "poll"])
export const groupRoleEnum = pgEnum("group_role", ["admin", "member"])

// ---------------------------------------------------------------------------
// Auth.js core tables (NextAuth Drizzle adapter)
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),

  // App-specific profile fields
  role: userRoleEnum("role").default("student").notNull(),
  gwid: varchar("gwid", { length: 32 }),
  school: text("school"),
  bio: text("bio"),
  status: text("status"),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),

  // Student-specific
  program: text("program"),
  year: text("year"),

  // Faculty-specific
  department: text("department"),
  position: text("position"),
  title: text("title"),
  researchAreas: text("research_areas"),
  officeLocation: text("office_location"),
  officeHours: text("office_hours"),
  courses: jsonb("courses").$type<string[]>().default([]).notNull(),
  links: jsonb("links").$type<Record<string, string>>().default({}).notNull(),

  // Alumni-specific
  graduationYear: varchar("graduation_year", { length: 8 }),
  company: text("company"),
  jobTitle: text("job_title"),
  industry: text("industry"),
  location: text("location"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
)

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  image: text("image"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  attendees: integer("attendees").default(0).notNull(),
  organizerId: text("organizer_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: eventStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.userId] }),
  }),
)

// ---------------------------------------------------------------------------
// Blogs
// ---------------------------------------------------------------------------
export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  type: blogTypeEnum("type").default("article").notNull(),
  visibility: visibilityEnum("visibility").default("public").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  coverImage: text("cover_image"),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const blogLikes = pgTable(
  "blog_likes",
  {
    blogId: uuid("blog_id")
      .notNull()
      .references(() => blogs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.blogId, t.userId] }) }),
)

export const blogComments = pgTable("blog_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogs.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Polls (a blog with type=poll has rows here)
export const pollOptions = pgTable("poll_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogs.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  position: integer("position").default(0).notNull(),
})

export const pollVotes = pgTable(
  "poll_votes",
  {
    optionId: uuid("option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.optionId, t.userId] }) }),
)

// ---------------------------------------------------------------------------
// Study Groups
// ---------------------------------------------------------------------------
export const studyGroups = pgTable("study_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  course: text("course").notNull(),
  subject: text("subject").notNull(),
  visibility: visibilityEnum("visibility").default("public").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  banner: text("banner"),
  nextMeeting: text("next_meeting"),
  permissions: jsonb("permissions").$type<{
    allowMemberPosts?: boolean
    allowMemberUploads?: boolean
    allowMemberEvents?: boolean
    notifyDashboard?: boolean
  }>().default({}).notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const studyGroupMembers = pgTable(
  "study_group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => studyGroups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: groupRoleEnum("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.groupId, t.userId] }) }),
)

// ---------------------------------------------------------------------------
// Study Materials
// ---------------------------------------------------------------------------
export const studyMaterials = pgTable("study_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  fileType: varchar("file_type", { length: 16 }).notNull(),
  fileUrl: text("file_url"),
  fileSize: text("file_size"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").default(0).notNull(), // stored *10 to avoid floats: 4.8 -> 48
  ratingCount: integer("rating_count").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const materialDownloads = pgTable(
  "material_downloads",
  {
    materialId: uuid("material_id")
      .notNull()
      .references(() => studyMaterials.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.materialId, t.userId] }) }),
)

export const materialFavorites = pgTable(
  "material_favorites",
  {
    materialId: uuid("material_id")
      .notNull()
      .references(() => studyMaterials.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.materialId, t.userId] }) }),
)

// ---------------------------------------------------------------------------
// Follows
// ---------------------------------------------------------------------------
export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followeeId: text("followee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followeeId] }),
    uniq: uniqueIndex("follows_unique").on(t.followerId, t.followeeId),
  }),
)

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  facultyId: text("faculty_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  status: text("status").default("pending").notNull(), // pending|confirmed|cancelled|completed
  topic: text("topic"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ---------------------------------------------------------------------------
// Messages (simple direct messages)
// ---------------------------------------------------------------------------
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromId: text("from_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toId: text("to_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  rsvps: many(eventRsvps),
  blogs: many(blogs),
  blogLikes: many(blogLikes),
  studyGroupsCreated: many(studyGroups),
  groupMemberships: many(studyGroupMembers),
  uploads: many(studyMaterials),
  downloads: many(materialDownloads),
  favorites: many(materialFavorites),
  followers: many(follows, { relationName: "followee" }),
  following: many(follows, { relationName: "follower" }),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  rsvps: many(eventRsvps),
}))

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}))

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, { fields: [blogs.authorId], references: [users.id] }),
  likes: many(blogLikes),
  comments: many(blogComments),
  options: many(pollOptions),
}))

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  blog: one(blogs, { fields: [blogComments.blogId], references: [blogs.id] }),
  author: one(users, { fields: [blogComments.authorId], references: [users.id] }),
}))

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  blog: one(blogs, { fields: [pollOptions.blogId], references: [blogs.id] }),
  votes: many(pollVotes),
}))

export const studyGroupsRelations = relations(studyGroups, ({ one, many }) => ({
  creator: one(users, { fields: [studyGroups.creatorId], references: [users.id] }),
  members: many(studyGroupMembers),
}))

export const studyGroupMembersRelations = relations(studyGroupMembers, ({ one }) => ({
  group: one(studyGroups, { fields: [studyGroupMembers.groupId], references: [studyGroups.id] }),
  user: one(users, { fields: [studyGroupMembers.userId], references: [users.id] }),
}))

export const studyMaterialsRelations = relations(studyMaterials, ({ one, many }) => ({
  uploader: one(users, { fields: [studyMaterials.uploaderId], references: [users.id] }),
  downloads: many(materialDownloads),
  favorites: many(materialFavorites),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  followee: one(users, {
    fields: [follows.followeeId],
    references: [users.id],
    relationName: "followee",
  }),
}))

// Convenience types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Blog = typeof blogs.$inferSelect
export type NewBlog = typeof blogs.$inferInsert
export type StudyGroup = typeof studyGroups.$inferSelect
export type NewStudyGroup = typeof studyGroups.$inferInsert
export type StudyMaterial = typeof studyMaterials.$inferSelect
export type NewStudyMaterial = typeof studyMaterials.$inferInsert
