import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import { sendAdminSubscriptionAlert } from '@/lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
    }

    const memberId = session.metadata?.memberId
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID missing from session' }, { status: 400 })
    }

    await connectDB()
    const member = await Member.findByIdAndUpdate(
      memberId,
      {
        marketplaceTier: 'marketplace',
        marketplaceSubscriptionId: session.subscription as string,
        bbbCheckStatus: 'pending',
      },
      { new: true }
    )

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Notify admin of marketplace seller subscription (non-blocking)
    sendAdminSubscriptionAlert({
      platform: 'cmb',
      subscriptionType: 'marketplace_seller',
      memberName: member.fullName,
      memberEmail: member.email,
      lodgeName: member.lodgeName ? `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}` : undefined,
      amount: '$2.00/month',
    }).catch(() => {})

    return NextResponse.json({ success: true, marketplaceTier: member.marketplaceTier })
  } catch (err: any) {
    console.error('Marketplace upgrade success error:', err)
    return NextResponse.json({ error: err.message || 'Upgrade confirmation failed' }, { status: 500 })
  }
}
