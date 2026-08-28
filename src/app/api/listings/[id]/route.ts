import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import Member from '@/models/Member'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const listing = await Listing.findById(params.id).lean()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    return NextResponse.json({ listing })
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

    const listing = await Listing.findById(params.id)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.sellerId.toString() !== member._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const allowed = ['title', 'description', 'price', 'category', 'condition', 'location', 'images', 'status']
    allowed.forEach(field => {
      if (body[field] !== undefined) (listing as any)[field] = body[field]
    })
    await listing.save()
    return NextResponse.json({ listing })
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

    const listing = await Listing.findById(params.id)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.sellerId.toString() !== member._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await listing.deleteOne()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
