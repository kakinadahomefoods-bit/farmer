import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  village: String,
  district: String,
  state: String,
  products: [String],
  quantity: String,
  availability: String,
  pickupDetails: String,
  images: [String],
  cloudinaryPublicIds: [String],
  qrImage: String,
  qrPublicId: String,
  bio: String,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

farmerSchema.index({ name: 'text', phone: 'text', village: 'text' })

export default mongoose.model('Farmer', farmerSchema)
