// Image upload helpers. We currently base64-encode the image and write it to
// the user's profile via the /api/profile/me endpoint. For production you'd
// swap this out for an upload to Vercel Blob, Cloudinary, S3, etc.

import { api } from "@/lib/api-client"

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function handleImageUpload(file: File): Promise<string> {
  return readFileAsDataURL(file)
}

export async function saveProfileImage(file: File): Promise<string> {
  const imageUrl = await readFileAsDataURL(file)
  try {
    await api.updateProfile({ image: imageUrl })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profileUpdated"))
    }
  } catch (error) {
    console.error("Error updating profile image:", error)
  }
  return imageUrl
}
