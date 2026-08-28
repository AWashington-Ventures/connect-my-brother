import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const member = await Member.findOne({ email: session.user.email })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    if (member.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: 'Active CMB membership required' }, { status: 403 })
    }
    if (member.eventsTier === 'poster') {
      return NextResponse.json({ error: 'Already an Events Poster' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: session.user.email,
      ...(member.stripeCustomerId ? { customer: member.stripeCustomerId } : {}),
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'CMB Events Poster',
            description: 'Post event flyers, announcements, and more on the CMB & CMS Events Board. Visible to all members.',
          },
          unit_amount: 100, // $1.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        memberId: member._id.toString(),
        upgradeType: 'events_poster',
      },
      success_url: `${appUrl}/events/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/events/upgrade`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Events upgrade checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout setup failed' }, { status: 500 })
  }
}
