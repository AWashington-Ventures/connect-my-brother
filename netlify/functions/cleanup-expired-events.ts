import { schedule } from '@netlify/functions'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

const cleanup = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI)
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // Delete events where endDate has passed, or (no endDate and start date has passed)
    const result = await mongoose.connection.collection('events').deleteMany({
      $or: [
        { endDate: { $lt: startOfToday } },
        { endDate: { $exists: false }, date: { $lt: startOfToday } },
        { endDate: null, date: { $lt: startOfToday } },
      ]
    })

    console.log(`[CMB Cleanup] Deleted ${result.deletedCount} expired events on ${new Date().toISOString()}`)
    return { statusCode: 200, body: JSON.stringify({ deleted: result.deletedCount }) }
  } catch (err: any) {
    console.error('[CMB Cleanup] Error:', err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

// Run daily at 1:00 AM UTC
export const handler = schedule('0 1 * * *', cleanup)
