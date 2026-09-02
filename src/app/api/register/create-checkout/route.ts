import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Free founding member period: all registrations are free until Jan 1, 2027
const FREE_UNTIL = new Date('2027-01-01T00:00:00Z')

export async function POST(req: NextRequest) {
  try {
    const { email, dues } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'

    // FREE FOUNDING MEMBER PERIOD — bypass Stripe until Jan 1, 2027
    if (new Date() < FREE_UNTIL) {
      return NextResponse.json({
        url: `${appUrl}/register/profile?session_id=FREE_2027`,
        free: true,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Connect My Brother Membership',
            description: 'Monthly verified Master Mason network access',
          },
          unit_amount: 500, // $5.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        fullName: dues.fullName,
        lodgeName: dues.lodgeName,
        lodgeNumber: dues.lodgeNumber,
        grandLodge: dues.grandLodge,
        cityState: dues.cityState,
        cardVoidDate: `${dues.voidDate} 20${dues.voidYear}`,
        cardIssuedDate: `${dues.issuedDate} 20${dues.issuedYear}`,
        grandSecretary: dues.grandSecretary,
        secretary: dues.secretary,
      },
      success_url: `${appUrl}/register/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/register/subscribe`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Payment setup failed' }, { status: 500 })
  }
}
