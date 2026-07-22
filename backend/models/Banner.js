import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  buttonText: String,
  redirectLink: String,
  // Legacy single image (kept for backward compatibility)
  image: String,
  cloudinaryPublicId: String,
  // Responsive images
  desktopImage: String,
  desktopPublicId: String,
  tabletImage: String,
  tabletPublicId: String,
  mobileImage: String,
  mobilePublicId: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  position: { type: String, enum: ['hero', 'promotional', 'side'], default: 'hero' },
  startDate: Date,
  endDate: Date,
}, { timestamps: true })

bannerSchema.index({ order: 1 })
bannerSchema.index({ position: 1, isActive: 1, order: 1 })

export default mongoose.model('Banner', bannerSchema)
