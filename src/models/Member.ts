import mongoose, { Schema, Document } from 'mongoose'

export interface IWebsite {
  label: string
  url: string
}

export interface IMember extends Document {
  fullName: string
  lodgeName: string
  lodgeNumber: string
  grandLodge: string
  cityState: string
  cardIssuedDate: string
  cardVoidDate: string
  grandSecretary: string
  duesCardVerified: boolean
  email: string
  passwordHash?: string
  profilePicture?: string
  photos?: string[]
  videos?: string[]
  websites?: IWebsite[]
  website?: string
  bio?: string
  skills: string[]
  skillsRaw: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus: 'active' | 'inactive' | 'pending'
  memberNumber?: number
  memberSince: Date
  createdAt: Date
  updatedAt: Date
}

const WebsiteSchema = new Schema<IWebsite>({
  label: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false })

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
  passwordHash: { type: String },
  profilePicture: String,
  photos: [String],
  videos: [String],
  websites: [WebsiteSchema],
  website: String,
  bio: String,
  skills: [{ type: String, index: true }],
  skillsRaw: { type: String, default: ''  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  memberNumber: Number,
  memberSince: { type: Date, default: Date.now },
}, { timestamps: true })

MemberSchema.index({ skills: 'text', lodgeName: 'text', fullName: 'text', cityState: 'text' })

export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema)
