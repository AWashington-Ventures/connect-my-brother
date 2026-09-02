import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    // Verify the Stripe checkout session
    let stripeSession
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription']
      })
    } catch {
      return NextResponse.json({ error: 'Invalid payment session' }, { status: 400 })
    }

    if (stripeSession.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    const stripeSubscriptionId = typeof stripeSession.subscription === 'string'
      ? stripeSession.subscription
      : (stripeSession.subscription as Stripe.Subscription)?.id || ''

    const stripeCustomerId = typeof stripeSession.customer === 'string'
      ? stripeSession.customer
      : (stripeSession.customer as Stripe.Customer)?.id || ''

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription found in session' }, { status: 400 })
    }

    await connectDB()
    await Member.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      {
        $set: {
          stripeSubscriptionId,
          stripeCustomerId: stripeCustomerId || undefined,
          subscriptionStatus: 'active',
          updatedAt: new Date(),
        }
      }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Reactivate success error:', err)
    return NextResponse.json({ error: err.message || 'Failed to reactivate' }, { status: 500 })
  }
}
