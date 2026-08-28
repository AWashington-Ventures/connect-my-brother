import mongoose, { Schema, Document } from 'mongoose'

export interface IListing extends Document {
  sellerId: mongoose.Types.ObjectId
  sellerName: string
  sellerLodge?: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'service'
  location: string
  platform: 'cmb' | 'cms' | 'both'
  status: 'active' | 'sold' | 'paused' | 'removed'
  shippingNote: string
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema<IListing>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  sellerName: { type: String, required: true },
  sellerLodge: String,
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'service'], default: 'good' },
  location: { type: String, required: true },
  platform: { type: String, enum: ['cmb', 'cms', 'both'], default: 'both' },
  status: { type: String, enum: ['active', 'sold', 'paused', 'removed'], default: 'active' },
  shippingNote: { type: String, default: 'Buyer arranges and pays for shipping. Seller ships after payment confirmed.' },
}, { timestamps: true })

ListingSchema.index({ sellerId: 1, status: 1 })
ListingSchema.index({ title: 'text', description: 'text', category: 'text' })
ListingSchema.index({ platform: 1, status: 1, createdAt: -1 })

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)
