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

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing payment session ID' }, { status: 400 })
    }
    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }
    if (!businessLicenseUrl) {
      return NextResponse.json({ error: 'Business license upload is required' }, { status: 400 })
    }

    // Verify Stripe payment
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (stripeSession.payment_status !== 'paid' && stripeSession.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
    }

    const memberId = stripeSession.metadata?.memberId
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID missing from payment session' }, { status: 400 })
    }

    await connectDB()

    // Verify the session email matches the member
    const member = await Member.findById(memberId)
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    if (member.email !== session.user.email) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
    }

    // Activate marketplace seller account
    await Member.findByIdAndUpdate(memberId, {
      marketplaceTier: 'marketplace',
      marketplaceSubscriptionId: stripeSession.subscription as string,
      businessLicenseUrl,
      businessLicenseVerified: false, // pending admin review
      bbbCheckStatus: 'pending',
      sellerProfileName: businessName.trim(),
      sellerDescription: businessDescription?.trim() || '',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Seller onboarding error:', err)
    return NextResponse.json({ error: err.message || 'Onboarding failed' }, { status: 500 })
  }
}
