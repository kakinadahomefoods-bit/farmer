import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

function generateSVG(entity, name) {
  const colors = {
    brand: '#D97745', brandDark: '#C05E2E', brandDarker: '#A74B1F',
    ink: '#8B5E3C', sand: '#F8F4EE', sandDark: '#EADBC8', white: '#FFFDF9',
  }
  const ename = (name || 'Organic').slice(0, 30)
  const clean = ename.replace(/[<>]/g, '')

  const templates = {
    product: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colors.white}"/><stop offset="100%" stop-color="${colors.sand}"/></linearGradient></defs>
      <rect fill="url(#bg)" width="600" height="600"/>
      <rect x="150" y="120" width="300" height="300" rx="24" fill="${colors.sandDark}" opacity="0.5"/>
      <circle cx="300" cy="270" r="60" fill="${colors.brand}" opacity="0.15"/>
      <path d="M240 270 l30-30 30 30" stroke="${colors.brand}" stroke-width="3" fill="none" opacity="0.4"/>
      <path d="M270 240 v60 h60" stroke="${colors.brand}" stroke-width="3" fill="none" opacity="0.4"/>
      <text x="300" y="500" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="${colors.ink}">${clean}</text>
      <text x="300" y="530" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${colors.ink}" opacity="0.6">Premium quality</text>
    </svg>`,

    farmer: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs><radialGradient id="fg" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stop-color="${colors.sand}"/><stop offset="100%" stop-color="${colors.sandDark}"/></radialGradient></defs>
      <rect width="400" height="400" fill="url(#fg)"/>
      <circle cx="200" cy="160" r="60" fill="${colors.ink}" opacity="0.15"/>
      <path d="M200 220 Q160 260 140 320 Q180 340 200 340 Q220 340 260 320 Q240 260 200 220Z" fill="${colors.ink}" opacity="0.12"/>
      <circle cx="200" cy="155" r="30" fill="${colors.brand}" opacity="0.15"/>
      <text x="200" y="370" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="${colors.ink}">${clean}</text>
    </svg>`,

    category: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs><linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${colors.white}"/><stop offset="100%" stop-color="${colors.sand}"/></linearGradient></defs>
      <rect fill="url(#cbg)" width="400" height="400"/>
      <circle cx="200" cy="180" r="80" fill="${colors.sandDark}" opacity="0.4"/>
      <text x="200" y="330" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="${colors.ink}">${clean}</text>
      <text x="200" y="355" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${colors.ink}" opacity="0.5">Shop Now →</text>
    </svg>`,

    banner: `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="500" viewBox="0 0 1920 500">
      <defs><linearGradient id="bbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colors.brandDarker}"/><stop offset="50%" stop-color="${colors.brandDark}"/><stop offset="100%" stop-color="${colors.ink}"/></linearGradient></defs>
      <rect fill="url(#bbg)" width="1920" height="500"/>
      <circle cx="1600" cy="100" r="180" fill="${colors.sand}" opacity="0.05"/>
      <circle cx="300" cy="400" r="150" fill="${colors.sandDark}" opacity="0.06"/>
      <circle cx="1800" cy="350" r="120" fill="${colors.brand}" opacity="0.08"/>
      <text x="960" y="260" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="${colors.sand}">${clean}</text>
    </svg>`,

    bundle: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs><linearGradient id="bbg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colors.white}"/><stop offset="100%" stop-color="${colors.sand}"/></linearGradient></defs>
      <rect fill="url(#bbg2)" width="600" height="600"/>
      <rect x="180" y="140" width="240" height="240" rx="20" fill="${colors.sandDark}" opacity="0.4"/>
      <rect x="210" y="170" width="180" height="180" rx="12" fill="${colors.brand}" opacity="0.12"/>
      <text x="300" y="470" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="${colors.ink}">${clean}</text>
      <text x="300" y="500" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${colors.ink}" opacity="0.6">Combo Offer</text>
    </svg>`,
  }

  const svg = templates[entity] || templates.product
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  return { svg, dataUrl }
}

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { entity, name, existingPublicId } = req.body
    if (!entity) return res.status(400).json({ error: 'Entity type is required' })

    const { svg, dataUrl } = generateSVG(entity, name || entity)

    if (existingPublicId) {
      await deleteFromCloudinary(existingPublicId).catch(() => {})
    }

    const result = await uploadToCloudinary(Buffer.from(svg), `haifarmer/${entity}s/auto`)
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      previewUrl: dataUrl,
      message: 'Image generated successfully',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/preview', protect, adminOnly, async (req, res) => {
  try {
    const { entity, name } = req.body
    if (!entity) return res.status(400).json({ error: 'Entity type is required' })
    const { dataUrl } = generateSVG(entity, name || entity)
    res.json({ previewUrl: dataUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
