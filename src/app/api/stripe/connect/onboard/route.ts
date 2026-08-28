import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export const dynamic = 'force-dynamic'

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
    if (member.marketplaceTier !== 'marketplace') {
      return NextResponse.json({ error: 'Marketplace Seller subscription required' }, { status: 403 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'

    let accountId = member.stripeConnectAccountId

    // Create a new Connect Express account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: member.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          memberId: member._id.toString(),
          platform: 'connectmybrother',
        },
      })
      accountId = account.id
      await Member.findByIdAndUpdate(member._id, {
        stripeConnectAccountId: accountId,
        stripeConnectOnboarded: false,
      })
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/seller/payout-setup?refresh=true`,
      return_url: `${appUrl}/seller/payout-return`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    console.error('Stripe Connect onboard error:', err)
    return NextResponse.json({ error: err.message || 'Payout setup failed' }, { status: 500 })
  }
}
