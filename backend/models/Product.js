import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weightLabel: String,
  sku: String,
  barcode: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  stock: { type: Number, default: 0 },
  unit: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: String,
  tagline: String,
  nutrition: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: String,
  basePrice: Number,
  discountPercent: { type: Number, default: 0 },
  images: [String],
  cloudinaryPublicIds: [String],
  variants: [variantSchema],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  totalSold: { type: Number, default: 0 },
}, { timestamps: true })

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  if (this.category) {
    this.categoryName = undefined
  }
  next()
})

productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1 })
productSchema.index({ isActive: 1, isFeatured: 1 })

export default mongoose.model('Product', productSchema)
