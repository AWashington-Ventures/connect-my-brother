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
      return NextResponse.json({ error: 'Active CMB membership required to upgrade' }, { status: 403 })
    }
    if (member.marketplaceTier === 'marketplace') {
      return NextResponse.json({ error: 'Already a Marketplace Seller' }, { status: 400 })
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
            name: 'CMB Marketplace Seller',
            description: 'List your business, goods, and services on the Connect My Brother Marketplace. Verified Mason sellers only.',
          },
          unit_amount: 200, // $2.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        memberId: member._id.toString(),
        upgradeType: 'marketplace',
      },
      success_url: `${appUrl}/seller/onboarding?session_id={CHECKOUT_SESSION_ID}`,  // → seller onboarding
      cancel_url: `${appUrl}/marketplace/upgrade`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Marketplace upgrade checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout setup failed' }, { status: 500 })
  }
}
