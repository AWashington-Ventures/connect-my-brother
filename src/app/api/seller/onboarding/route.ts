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

    const { sessionId, businessName, businessDescription, businessLicenseUrl } = await req.json()

    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }
    if (!businessLicenseUrl) {
      return NextResponse.json({ error: 'Business license upload is required' }, { status: 400 })
    }

    await connectDB()

    const member = await Member.findOne({ email: session.user.email })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    let memberId = member._id.toString()
    let subscriptionId = member.marketplaceSubscriptionId

    if (sessionId) {
      // New seller flow — verify Stripe payment
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
      if (stripeSession.payment_status !== 'paid' && stripeSession.status !== 'complete') {
        return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
      }
      const stripeMetaMemberId = stripeSession.metadata?.memberId
      if (!stripeMetaMemberId) {
        return NextResponse.json({ error: 'Member ID missing from payment session' }, { status: 400 })
      }
      if (stripeMetaMemberId !== memberId) {
        return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
      }
      subscriptionId = stripeSession.subscription as string
    } else {
      // Existing marketplace seller — re-uploading license
      if (member.marketplaceTier !== 'marketplace') {
        return NextResponse.json({ error: 'Marketplace Seller subscription required' }, { status: 403 })
      }
    }

    // Save seller profile & license
    await Member.findByIdAndUpdate(memberId, {
      marketplaceTier: 'marketplace',
      ...(subscriptionId ? { marketplaceSubscriptionId: subscriptionId } : {}),
      businessLicenseUrl,
      businessLicenseVerified: false,
      bbbCheckStatus: 'pending',
      sellerProfileName: businessName.trim(),
      sellerDescription: businessDescription?.trim() || '',
    })

    // Removed redundant second update block

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Seller onboarding error:', err)
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 })
  }
}
