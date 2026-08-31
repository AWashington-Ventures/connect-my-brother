import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import Member from '@/models/Member'
import { sendBulkAlerts } from '@/lib/resend'

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

    const rawListings = await Listing.find(query).sort({ createdAt: -1 }).limit(100).lean()

    // For marketplace view (not mine), enrich listings with seller BBB status
    let listings: any[] = rawListings
    if (!mine && rawListings.length > 0) {
      const sellerIds = [...new Set(rawListings.map((l: any) => l.sellerId?.toString()).filter(Boolean))]
      const sellers = await Member.find(
        { _id: { $in: sellerIds } },
        { _id: 1, bbbCheckStatus: 1 }
      ).lean()
      const sellerMap = Object.fromEntries(sellers.map((s: any) => [s._id.toString(), s.bbbCheckStatus]))
      listings = rawListings.map((l: any) => ({
        ...l,
        sellerBbbStatus: sellerMap[l.sellerId?.toString()] || 'not_checked',
      }))
    }

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

    // Fire alert emails to members who have newMarketplaceListing alerts enabled (non-blocking)
    Member.find(
      { subscriptionStatus: 'active', 'alertPreferences.newMarketplaceListing': true, _id: { $ne: member._id } },
      { email: 1, fullName: 1 }
    ).lean().then((subscribers: any[]) => {
      if (subscribers.length > 0) {
        sendBulkAlerts({
          members: subscribers,
          alertType: 'newMarketplaceListing',
          itemTitle: listing.title,
          itemDescription: listing.description,
          itemUrl: `https://connectmybrother.com/marketplace/${listing._id}`,
          platform: 'cmb',
        }).catch(() => {}) // silent fail — never block listing creation
      }
    }).catch(() => {})

    return NextResponse.json({ listing }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
