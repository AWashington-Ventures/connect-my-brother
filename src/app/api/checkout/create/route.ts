import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import Listing from '@/models/Listing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId } = await req.json()
    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    await connectDB()

    const buyer = await Member.findOne({ email: session.user.email })
    if (!buyer) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    if (buyer.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: 'Active CMB membership required to purchase' }, { status: 403 })
    }

    const listing = await Listing.findById(listingId)
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'This listing is no longer available' }, { status: 400 })
    }
    if (listing.sellerId.toString() === buyer._id.toString()) {
      return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })
    }

    const seller = await Member.findById(listing.sellerId)
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'
    const amountCents = Math.round(listing.price * 100)

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: buyer.email,
      ...(buyer.stripeCustomerId ? { customer: buyer.stripeCustomerId } : {}),
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description: `Sold by ${listing.sellerName}${listing.sellerLodge ? ` · ${listing.sellerLodge}` : ''} via Connect My Brother Marketplace`,
            ...(listing.images?.length > 0 ? { images: [listing.images[0]] } : {}),
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        listingId: listing._id.toString(),
        buyerId: buyer._id.toString(),
        sellerId: seller._id.toString(),
        buyerEmail: buyer.email,
        sellerEmail: seller.email,
        buyerName: buyer.fullName,
        sellerName: seller.fullName,
        listingTitle: listing.title,
        listingImage: listing.images?.[0] || '',
        platform: listing.platform || 'cmb',
        shippingNote: listing.shippingNote || '',
      },
      success_url: `${appUrl}/marketplace/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/marketplace/${listingId}`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Checkout create error:', err)
    return NextResponse.json({ error: err.message || 'Checkout setup failed' }, { status: 500 })
  }
}
