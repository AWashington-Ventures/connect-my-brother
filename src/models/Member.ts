import mongoose, { Schema, Document } from 'mongoose'

export interface IWebsite {
  label: string
  url: string
  icon?: string
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
  // Marketplace fields
  marketplaceTier: 'basic' | 'marketplace'
  marketplaceSubscriptionId?: string
  businessLicenseUrl?: string
  businessLicenseVerified: boolean
  bbbCheckStatus: 'pending' | 'clear' | 'flagged' | 'not_found' | 'not_checked'
  bbbCheckDate?: Date
  sellerProfileName?: string
  sellerDescription?: string
  stripeConnectAccountId?: string
  stripeConnectOnboarded: boolean
  eventsTier: 'viewer' | 'poster'
  eventsSubscriptionId?: string
  platform: 'cmb' | 'cms' | 'both'
  memberNumber?: number
  memberSince: Date
  createdAt: Date
  updatedAt: Date
  alertPreferences: {
    newEvent: boolean
    newMarketplaceListing: boolean
    newJobListing: boolean
  }
}

const WebsiteSchema = new Schema<IWebsite>({
  label: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String },
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
  // Marketplace tier: 'basic' = can browse/buy; 'marketplace' = can also sell ($2/month)
  marketplaceTier: { type: String, enum: ['basic', 'marketplace'], default: 'basic' },
  // Events tier: 'viewer' = can browse events (default); 'poster' = can post events ($1/month)
  eventsTier: { type: String, enum: ['viewer', 'poster'], default: 'viewer' },
  eventsSubscriptionId: String,
  marketplaceSubscriptionId: String,
  businessLicenseUrl: String,
  businessLicenseVerified: { type: Boolean, default: false },
  bbbCheckStatus: { type: String, enum: ['pending', 'clear', 'flagged', 'not_found', 'not_checked'], default: 'not_checked' },
  bbbCheckDate: Date,
  sellerProfileName: String,
  sellerDescription: String,
  stripeConnectAccountId: String,
  stripeConnectOnboarded: { type: Boolean, default: false },
  // Cross-platform field: supports CMB/CMS shared directory, marketplace, and job board
  platform: { type: String, enum: ['cmb', 'cms', 'both'], default: 'cmb' },
  memberNumber: Number,
  memberSince: { type: Date, default: Date.now },
  alertPreferences: {
    newEvent: { type: Boolean, default: true },
    newMarketplaceListing: { type: Boolean, default: true },
    newJobListing: { type: Boolean, default: true },
  },
}, { timestamps: true })

MemberSchema.index({ skills: 'text', lodgeName: 'text', fullName: 'text', cityState: 'text' })

export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema)
