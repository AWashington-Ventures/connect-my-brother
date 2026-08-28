import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  listingId: mongoose.Types.ObjectId
  buyerId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  buyerEmail: string
  sellerEmail: string
  buyerName: string
  sellerName: string
  listingTitle: string
  listingImage?: string
  amount: number // in cents
  currency: string
  stripeSessionId: string
  stripePaymentIntentId?: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded' | 'disputed'
  platform: 'cmb' | 'cms' | 'both'
  shippingNote?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  buyerEmail: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  buyerName: { type: String, required: true },
  sellerName: { type: String, required: true },
  listingTitle: { type: String, required: true },
  listingImage: String,
  amount: { type: Number, required: true }, // cents
  currency: { type: String, default: 'usd' },
  stripeSessionId: { type: String, required: true, unique: true },
  stripePaymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'completed', 'refunded', 'disputed'],
    default: 'pending',
  },
  platform: { type: String, enum: ['cmb', 'cms', 'both'], default: 'cmb' },
  shippingNote: String,
}, { timestamps: true })

OrderSchema.index({ buyerId: 1, createdAt: -1 })
OrderSchema.index({ sellerId: 1, createdAt: -1 })
OrderSchema.index({ stripeSessionId: 1 })
OrderSchema.index({ listingId: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
