import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const billingPeriod = body.billingPeriod === 'annual' ? 'annual' : 'monthly'
    const isAnnual = billingPeriod === 'annual'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: session.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: isAnnual ? 'Connect My Brother Membership (Annual)' : 'Connect My Brother Membership',
            description: isAnnual
              ? 'Annual verified Master Mason network access — save 10% vs monthly ($5/mo).'
              : 'Monthly verified Master Mason network access',
          },
          unit_amount: isAnnual ? 5400 : 500, // $54/year or $5.00/month
          recurring: { interval: isAnnual ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      metadata: { billingPeriod },
      success_url: `${appUrl}/reactivate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/reactivate`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Reactivate checkout error:', err)
    return NextResponse.json({ error: err.message || 'Payment setup failed' }, { status: 500 })
  }
}
