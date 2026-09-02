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

    const body = await req.json().catch(() => ({}))
    const billingPeriod = body.billingPeriod === 'annual' ? 'annual' : 'monthly'
    const isAnnual = billingPeriod === 'annual'
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
            name: isAnnual ? 'CMB Events Poster (Annual)' : 'CMB Events Poster',
            description: isAnnual
              ? 'Annual Events Poster access — save 10% vs monthly ($1/mo). Post on the CMB & CMS Events Board.'
              : 'Post event flyers, announcements, and more on the CMB & CMS Events Board. Visible to all members.',
          },
          unit_amount: isAnnual ? 1100 : 100, // $11/year or $1.00/month
          recurring: { interval: isAnnual ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        memberId: member._id.toString(),
        upgradeType: 'events_poster',
        billingPeriod,
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
