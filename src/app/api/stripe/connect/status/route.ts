import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: NextRequest) {
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

    if (!member.stripeConnectAccountId) {
      return NextResponse.json({ onboarded: false, chargesEnabled: false, payoutsEnabled: false })
    }

    const account = await stripe.accounts.retrieve(member.stripeConnectAccountId)
    const onboarded = account.details_submitted && account.charges_enabled

    // Update member record if newly onboarded
    if (onboarded && !member.stripeConnectOnboarded) {
      await Member.findByIdAndUpdate(member._id, { stripeConnectOnboarded: true })
    }

    return NextResponse.json({
      onboarded: onboarded || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
    })
  } catch (err: any) {
    console.error('Stripe Connect status error:', err)
    return NextResponse.json({ error: err.message || 'Status check failed' }, { status: 500 })
  }
}
