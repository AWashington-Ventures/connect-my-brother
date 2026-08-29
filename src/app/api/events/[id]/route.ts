import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Event from '@/models/Event'
import Member from '@/models/Member'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const event = await Event.findById(params.id).lean()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    return NextResponse.json({ event })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const member = await Member.findOne({ email: session.user.email })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    if (member.eventsTier !== 'poster') {
      return NextResponse.json({ error: 'Events Poster subscription required' }, { status: 403 })
    }

    const event = await Event.findById(params.id)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.postedBy.toString() !== member._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized — you can only edit your own events' }, { status: 403 })
    }

    const body = await req.json()
    const allowed = ['title', 'description', 'date', 'endDate', 'location', 'flyer', 'tags', 'category']
    allowed.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'date' || field === 'endDate') {
          (event as any)[field] = body[field] ? new Date(body[field]) : undefined
        } else {
          (event as any)[field] = body[field]
        }
      }
    })
    await event.save()
    return NextResponse.json({ event })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const member = await Member.findOne({ email: session.user.email })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const event = await Event.findById(params.id)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.postedBy.toString() !== member._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await event.deleteOne()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
