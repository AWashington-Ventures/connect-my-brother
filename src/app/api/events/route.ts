import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Event from '@/models/Event'
import Member from '@/models/Member'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const query: any = { approved: true }

    // Filter by platform (default: show cmb + both)
    query.platform = { $in: ['cmb', 'both'] }

    // Text search
    const search = searchParams.get('search')
    if (search) {
      query.$text = { $search: search }
    }

    // Date filter
    const date = searchParams.get('date')
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }

    // Month filter (for calendar)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      query.date = { $gte: start, $lte: end }
    }

    // Location filter
    const location = searchParams.get('location')
    if (location) {
      query.location = { $regex: location, $options: 'i' }
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(100)
      .lean()

    return NextResponse.json({ events })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const member = await Member.findOne({ email: session.user.email })
    if (!member || member.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: 'Active CMB membership required' }, { status: 403 })
    }
    if (member.eventsTier !== 'poster') {
      return NextResponse.json({ error: 'Events Poster subscription required to post events' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, date, endDate, location, flyer, tags, category } = body

    if (!title || !description || !date || !location) {
      return NextResponse.json({ error: 'Title, description, date, and location are required' }, { status: 400 })
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      flyer,
      tags: tags || [],
      category: category || 'General',
      platform: 'cmb',
      postedBy: member._id,
      postedByName: member.fullName,
      postedByLodge: `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}`,
      approved: true,
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
