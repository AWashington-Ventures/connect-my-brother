import { schedule } from '@netlify/functions'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

const advance = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI)
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Find all recurring events whose date has passed
    const expired = await mongoose.connection.collection('events').find({
      recurrence: { $in: ['weekly', 'monthly', 'yearly'] },
      $or: [
        { endDate: { $lt: now } },
        { endDate: { $exists: false }, date: { $lt: now } },
        { endDate: null, date: { $lt: now } },
      ]
    }).toArray()

    let advanced = 0
    for (const event of expired) {
      const eventDate = new Date(event.date)
      const eventEndDate = event.endDate ? new Date(event.endDate) : null
      let newDate: Date
      let newEndDate: Date | null = null

      if (event.recurrence === 'weekly') {
        newDate = new Date(eventDate)
        newDate.setDate(newDate.getDate() + 7)
        if (eventEndDate) {
          newEndDate = new Date(eventEndDate)
          newEndDate.setDate(newEndDate.getDate() + 7)
        }
      } else if (event.recurrence === 'monthly') {
        newDate = new Date(eventDate)
        newDate.setMonth(newDate.getMonth() + 1)
        if (eventEndDate) {
          newEndDate = new Date(eventEndDate)
          newEndDate.setMonth(newEndDate.getMonth() + 1)
        }
      } else { // yearly
        newDate = new Date(eventDate)
        newDate.setFullYear(newDate.getFullYear() + 1)
        if (eventEndDate) {
          newEndDate = new Date(eventEndDate)
          newEndDate.setFullYear(newEndDate.getFullYear() + 1)
        }
      }

      const update: any = { date: newDate }
      if (newEndDate) update.endDate = newEndDate
      else if (eventEndDate) update.$unset = { endDate: '' }

      await mongoose.connection.collection('events').updateOne(
        { _id: event._id },
        newEndDate ? { $set: update } : { $set: { date: newDate }, $unset: eventEndDate ? { endDate: '' } : {} }
      )
      advanced++
    }

    console.log(`[CMB Recurring] Advanced ${advanced} recurring events on ${new Date().toISOString()}`)
    return { statusCode: 200, body: JSON.stringify({ advanced }) }
  } catch (err: any) {
    console.error('[CMB Recurring] Error:', err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

// Run daily at 2:00 AM UTC (after cleanup at 1:00 AM)
export const handler = schedule('0 2 * * *', advance)
