import mongoose, { Schema, Document } from 'mongoose'

export interface IMember extends Document {
  // From dues card
  fullName: string
  lodgeName: string
  lodgeNumber: string
  grandLodge: string
  cityState: string
  cardIssuedDate: string
  cardVoidDate: string
  grandSecretary: string
  duesCardVerified: boolean
  // Profile
  email: string
  profilePicture?: string
  photos?: string[]
  website?: string
  bio?: string
  skills: string[] // parsed keywords
  skillsRaw: string // original entry
  // Platform
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus: 'active' | 'inactive' | 'pending'
  memberSince: Date
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>({
  fullName: { type: String, required: true },
  lodgeName: { type: String, required: true },
  lodgeNumber: { type: String, required: true },
  grandLodge: { type: String, required: true },
  cityState: { type: String, required: true },
  cardIssuedDate: { type: String, required: true },
  cardVoidDate: { type: String, required: true },
  grandSecretary: { type: String, required: true },
  duesCardVerified: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  profilePicture: String,
  photos: [String],
  website: String,
  bio: String,
  skills: [{ type: String, index: true }],
  skillsRaw: { type: String, default: '' },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  memberSince: { type: Date, default: Date.now },
}, { timestamps: true })

// Text index for keyword search
MemberSchema.index({ skills: 'text', lodgeName: 'text', fullName: 'text', cityState: 'text' })

export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema)
