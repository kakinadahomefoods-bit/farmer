import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'

export async function uploadToCloudinary(buffer, folder = 'haifarmer') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('Cloudinary delete error:', err)
  }
}

export function getPublicIdFromUrl(url) {
  if (!url) return null
  const parts = url.split('/')
  const folder = parts[parts.length - 2]
  const file = parts[parts.length - 1].split('.')[0]
  return `${folder}/${file}`
}
