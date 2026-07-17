import mongoose from 'mongoose'

const bundleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  variantName: String,
  variantWeight: String,
  quantity: { type: Number, default: 1 },
  price: Number,
  image: String,
})

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  image: String,
  cloudinaryPublicId: String,
  price: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isCombo: { type: Boolean, default: true },
  items: [bundleItemSchema],
  totalSold: { type: Number, default: 0 },
}, { timestamps: true })

bundleSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
  }
  if (this.items?.length > 0) {
    const raw = this.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    this.price = raw > 0 ? Number((raw - raw * (this.discountPercent || 0) / 100).toFixed(2)) : 0
  }
  next()
})

bundleSchema.index({ slug: 1 })
bundleSchema.index({ isActive: 1, isCombo: 1 })

export default mongoose.model('Bundle', bundleSchema)