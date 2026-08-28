import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import Listing from '@/models/Listing'
import Order from '@/models/Order'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    await connectDB()

    // Idempotency — if order already exists, return it
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId })
    if (existingOrder) {
      return NextResponse.json({ success: true, order: existingOrder, alreadyProcessed: true })
    }

    const meta = checkoutSession.metadata || {}
    const amountCents = checkoutSession.amount_total || 0

    // Create the order record
    const order = await Order.create({
      listingId: meta.listingId,
      buyerId: meta.buyerId,
      sellerId: meta.sellerId,
      buyerEmail: meta.buyerEmail,
      sellerEmail: meta.sellerEmail,
      buyerName: meta.buyerName,
      sellerName: meta.sellerName,
      listingTitle: meta.listingTitle,
      listingImage: meta.listingImage || '',
      amount: amountCents,
      currency: 'usd',
      stripeSessionId: sessionId,
      stripePaymentIntentId: checkoutSession.payment_intent as string || '',
      status: 'paid',
      platform: meta.platform || 'cmb',
      shippingNote: meta.shippingNote || '',
    })

    // Mark the listing as sold
    await Listing.findByIdAndUpdate(meta.listingId, { status: 'sold' })

    const amountDollars = (amountCents / 100).toFixed(2)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://connectmybrother.com'

    // Send confirmation email to BUYER
    try {
      await resend.emails.send({
        from: 'Connect My Brother <noreply@connectmybrother.com>',
        to: meta.buyerEmail,
        subject: `Order Confirmed — ${meta.listingTitle}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1a0a2e; color: #d4af37; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d4af37; font-size: 24px; margin: 0;">✅ Order Confirmed</h1>
              <p style="color: #a89060; margin-top: 8px;">Connect My Brother Marketplace</p>
            </div>
            <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #d4af37; font-size: 18px; margin: 0 0 12px 0;">${meta.listingTitle}</h2>
              <p style="color: #a89060; margin: 0 0 8px 0;">Amount paid: <strong style="color: #d4af37;">$${amountDollars}</strong></p>
              <p style="color: #a89060; margin: 0 0 8px 0;">Seller: <strong style="color: #d4af37;">${meta.sellerName}</strong></p>
              <p style="color: #a89060; margin: 0;">Order ID: <code style="color: #d4af37; font-size: 12px;">${order._id}</code></p>
            </div>
            <div style="background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #a89060; margin: 0; font-size: 14px;">📦 <strong style="color: #d4af37;">Shipping:</strong> Please contact the seller directly to arrange shipping. The seller will ship your item after payment is confirmed.</p>
            </div>
            <div style="border-top: 1px solid rgba(212,175,55,0.2); padding-top: 16px; margin-top: 24px;">
              <p style="color: #a89060; font-size: 11px; margin: 0;">A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold through this platform. All transactions are solely between the buyer and the seller.</p>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Buyer email error:', emailErr)
    }

    // Send notification email to SELLER
    try {
      await resend.emails.send({
        from: 'Connect My Brother <noreply@connectmybrother.com>',
        to: meta.sellerEmail,
        subject: `🎉 You made a sale! — ${meta.listingTitle}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1a0a2e; color: #d4af37; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d4af37; font-size: 24px; margin: 0;">🎉 You Made a Sale!</h1>
              <p style="color: #a89060; margin-top: 8px;">Connect My Brother Marketplace</p>
            </div>
            <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #d4af37; font-size: 18px; margin: 0 0 12px 0;">${meta.listingTitle}</h2>
              <p style="color: #a89060; margin: 0 0 8px 0;">Sale amount: <strong style="color: #d4af37;">$${amountDollars}</strong></p>
              <p style="color: #a89060; margin: 0 0 8px 0;">Buyer: <strong style="color: #d4af37;">${meta.buyerName}</strong></p>
              <p style="color: #a89060; margin: 0;">Order ID: <code style="color: #d4af37; font-size: 12px;">${order._id}</code></p>
            </div>
            <div style="background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #a89060; margin: 0; font-size: 14px;">📦 <strong style="color: #d4af37;">Next step:</strong> The buyer will contact you to arrange shipping. Please ship the item promptly once contact is made.</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${appUrl}/seller/dashboard" style="background: #d4af37; color: #1a0a2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">View Seller Dashboard →</a>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Seller email error:', emailErr)
    }

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    console.error('Checkout success error:', err)
    return NextResponse.json({ error: err.message || 'Order processing failed' }, { status: 500 })
  }
}
