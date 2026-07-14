import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  buttonText: String,
  redirectLink: String,
  image: { type: String, required: true },
  cloudinaryPublicId: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  position: { type: String, enum: ['hero', 'promotional', 'side'], default: 'hero' },
}, { timestamps: true })

bannerSchema.index({ order: 1 })

export default mongoose.model('Banner', bannerSchema)
