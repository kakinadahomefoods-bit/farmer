import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js'
import multer from 'multer'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const folder = req.body.folder || 'haifarmer'
    const result = await uploadToCloudinary(req.file.buffer, folder)
    res.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/multiple', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const folder = req.body.folder || 'haifarmer'
    const results = await Promise.all(req.files.map(file => uploadToCloudinary(file.buffer, folder)))
    res.json(results.map(r => ({ url: r.secure_url, publicId: r.public_id })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/', protect, adminOnly, async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })
    const publicId = getPublicIdFromUrl(url)
    if (publicId) await deleteFromCloudinary(publicId)
    res.json({ message: 'Image deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
