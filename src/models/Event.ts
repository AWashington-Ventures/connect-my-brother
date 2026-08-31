import mongoose, { Schema, Document } from 'mongoose'

export interface IEvent extends Document {
  title: string
  description: string
  date: Date
  endDate?: Date
  location: string
  flyer?: string // Cloudinary URL
  tags: string[]
  category: string
  platform: 'cmb' | 'cms' | 'both'
  postedBy: mongoose.Types.ObjectId
  postedByName: string
  postedByLodge?: string
  approved: boolean
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly'
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  flyer: { type: String }, // Cloudinary image URL
  tags: [{ type: String }],
  category: { type: String, default: 'General' },
  platform: { type: String, enum: ['cmb', 'cms', 'both'], default: 'cmb' },
  postedBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  postedByName: { type: String, required: true },
  postedByLodge: { type: String },
  approved: { type: Boolean, default: true }, // auto-approve for now
  recurrence: { type: String, enum: ['none', 'weekly', 'monthly', 'yearly'], default: 'none' },
}, { timestamps: true })

// Full text search index
EventSchema.index({ title: 'text', description: 'text', location: 'text', tags: 'text' })
EventSchema.index({ date: 1 })
EventSchema.index({ platform: 1, date: 1 })

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
