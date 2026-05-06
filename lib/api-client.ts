/**
 * Tiny fetch wrapper for the GW Connect REST API. All routes live under /api.
 * Each helper returns parsed JSON or throws on a non-2xx response.
 */
async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json") ? await res.json() : await res.text()
  if (!res.ok) {
    const message = (data as any)?.error || (typeof data === "string" ? data : "Request failed")
    throw new Error(message)
  }
  return data as T
}

export const api = {
  // Events
  listEvents: () => request<{ events: any[] }>("/api/events"),
  getEvent: (id: string) => request<{ event: any }>(`/api/events/${id}`),
  createEvent: (event: any) =>
    request<{ event: any }>("/api/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  rsvpEvent: (id: string, status: "going" | "maybe" | "not-going") =>
    request<{ ok: true; status: string }>(`/api/events/${id}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  myEvents: () => request<{ events: any[] }>("/api/events/mine"),

  // Blogs
  listBlogs: () => request<{ blogs: any[] }>("/api/blogs"),
  getBlog: (id: string) => request<{ blog: any }>(`/api/blogs/${id}`),
  createBlog: (blog: any) =>
    request<{ blog: any }>("/api/blogs", { method: "POST", body: JSON.stringify(blog) }),
  toggleBlogLike: (id: string) =>
    request<{ liked: boolean }>(`/api/blogs/${id}/like`, { method: "POST" }),
  listBlogComments: (id: string) =>
    request<{ comments: any[] }>(`/api/blogs/${id}/comments`),
  addBlogComment: (id: string, content: string) =>
    request(`/api/blogs/${id}/comments`, { method: "POST", body: JSON.stringify({ content }) }),

  // Study groups
  listGroups: () => request<{ groups: any[] }>("/api/study-groups"),
  getGroup: (id: string) => request<{ group: any }>(`/api/study-groups/${id}`),
  createGroup: (group: any) =>
    request<{ group: any }>("/api/study-groups", { method: "POST", body: JSON.stringify(group) }),
  joinGroup: (id: string) =>
    request<{ joined: boolean }>(`/api/study-groups/${id}/membership`, { method: "POST" }),
  leaveGroup: (id: string) =>
    request<{ joined: boolean }>(`/api/study-groups/${id}/membership`, { method: "DELETE" }),
  myGroups: () => request<{ groups: any[] }>("/api/study-groups/mine"),

  // Study materials
  listMaterials: () => request<{ materials: any[] }>("/api/study-materials"),
  getMaterial: (id: string) => request<{ material: any }>(`/api/study-materials/${id}`),
  createMaterial: (m: any) =>
    request<{ material: any }>("/api/study-materials", { method: "POST", body: JSON.stringify(m) }),
  downloadMaterial: (id: string) =>
    request(`/api/study-materials/${id}/download`, { method: "POST" }),
  toggleFavorite: (id: string) =>
    request<{ favorite: boolean }>(`/api/study-materials/${id}/favorite`, { method: "POST" }),
  myMaterials: (tab: "uploaded" | "favorites" | "downloaded") =>
    request<{ materials: any[] }>(`/api/study-materials/mine?tab=${tab}`),

  // Profiles
  myProfile: () => request<{ profile: any }>("/api/profile/me"),
  updateProfile: (patch: any) =>
    request<{ profile: any }>("/api/profile/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  getProfile: (id: string) => request<{ profile: any }>(`/api/profile/${id}`),

  // Follows
  isFollowing: (userId: string) =>
    request<{ following: boolean }>(`/api/follows/${userId}`),
  follow: (userId: string) =>
    request<{ following: boolean }>(`/api/follows/${userId}`, { method: "POST" }),
  unfollow: (userId: string) =>
    request<{ following: boolean }>(`/api/follows/${userId}`, { method: "DELETE" }),

  // Directory
  directory: (params?: { q?: string; role?: "student" | "faculty" | "alumni" }) => {
    const sp = new URLSearchParams()
    if (params?.q) sp.set("q", params.q)
    if (params?.role) sp.set("role", params.role)
    return request<{ people: any[] }>(`/api/directory${sp.toString() ? "?" + sp.toString() : ""}`)
  },

  // Auth
  register: (payload: any) =>
    request<{ user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}
