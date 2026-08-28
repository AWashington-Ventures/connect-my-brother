import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import Member from '@/models/Member'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const member = await Member.findOne({ email: session.user.email })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const mine = searchParams.get('mine') === 'true'

    const query: any = mine
      ? { sellerId: member._id }
      : { status: 'active', platform: { $in: ['cmb', 'both'] } }

    const listings = await Listing.find(query).sort({ createdAt: -1 }).limit(100).lean()
    return NextResponse.json({ listings })
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
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    if (member.marketplaceTier !== 'marketplace') {
      return NextResponse.json({ error: 'Marketplace seller account required' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, price, category, images, condition, location } = body

    if (!title || !description || price === undefined || !category || !location) {
      return NextResponse.json({ error: 'Title, description, price, category, and location are required' }, { status: 400 })
    }

    const listing = await Listing.create({
      sellerId: member._id,
      sellerName: member.sellerProfileName || member.fullName,
      sellerLodge: `${member.lodgeName || ''}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}`,
      title, description,
      price: parseFloat(price),
      category, images: images || [], condition: condition || 'good',
      location, platform: 'both', status: 'active',
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
