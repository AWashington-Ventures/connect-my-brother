import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import Stripe from 'stripe'
import { sendAdminSubscriptionAlert } from '@/lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;:]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.toLowerCase())
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { dues, email, sessionId, bio, website, skillsRaw, profilePicture } = body

    // SECURITY: Require and verify Stripe session before creating any member
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Payment verification required. Please complete checkout first.' },
        { status: 400 }
      )
    }

    // Verify the Stripe checkout session
    let stripeSession
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription']
      })
    } catch (stripeErr: any) {
      return NextResponse.json(
        { error: 'Invalid payment session. Please restart registration.' },
        { status: 400 }
      )
    }

    // Validate session payment status
    if (stripeSession.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed. Please complete your subscription payment first.' },
        { status: 402 }
      )
    }

    if (stripeSession.mode !== 'subscription') {
      return NextResponse.json(
        { error: 'Invalid payment type. Subscription required.' },
        { status: 400 }
      )
    }

    // Use the verified email from Stripe (prevents email manipulation)
    const verifiedEmail = (stripeSession.customer_email || email || '').toLowerCase()
    if (!verifiedEmail) {
      return NextResponse.json(
        { error: 'Email not found in payment session.' },
        { status: 400 }
      )
    }

    // Extract Stripe IDs for account management
    const stripeCustomerId = typeof stripeSession.customer === 'string'
      ? stripeSession.customer
      : stripeSession.customer?.id || ''

    const stripeSubscriptionId = typeof stripeSession.subscription === 'string'
      ? stripeSession.subscription
      : (stripeSession.subscription as Stripe.Subscription)?.id || ''

    const skills = parseSkills(skillsRaw || '')

    // Check if member already exists (handles page refresh after payment)
    const existing = await Member.findOne({ email: verifiedEmail })
    if (existing) {
      // Update profile and ensure Stripe IDs are saved
      existing.bio = bio
      existing.website = website
      existing.skills = skills
      existing.skillsRaw = skillsRaw
      if (profilePicture) existing.profilePicture = profilePicture
      if (stripeCustomerId && !existing.stripeCustomerId) existing.stripeCustomerId = stripeCustomerId
      if (stripeSubscriptionId && !existing.stripeSubscriptionId) existing.stripeSubscriptionId = stripeSubscriptionId
      if (!existing.subscriptionStatus) existing.subscriptionStatus = 'active'
      await existing.save()
      return NextResponse.json({ success: true, memberId: existing._id })
    }

    // Create new member — only after Stripe payment is verified
    const member = await Member.create({
      email: verifiedEmail,
      fullName: dues?.fullName || '',
      lodgeName: dues?.lodgeName || '',
      lodgeNumber: dues?.lodgeNumber || '',
      grandLodge: dues?.grandLodge || '',
      cityState: dues?.cityState || '',
      cardIssuedDate: dues ? `${dues.issuedDate} 20${dues.issuedYear}` : '',
      cardVoidDate: dues ? `${dues.voidDate} 20${dues.voidYear}` : '',
      grandSecretary: dues?.grandSecretary || '',
      duesCardVerified: true,
      subscriptionStatus: 'active',
      stripeCustomerId,
      stripeSubscriptionId,
      bio,
      website,
      skills,
      skillsRaw,
      profilePicture: profilePicture || '',
    })

    // Notify admin of new paid subscription (non-blocking)
    sendAdminSubscriptionAlert({
      platform: 'cmb',
      subscriptionType: 'new_member',
      memberName: member.fullName,
      memberEmail: verifiedEmail,
      lodgeName: member.lodgeName ? `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}` : undefined,
      amount: '$5.00/month',
    }).catch(() => {})

    return NextResponse.json({ success: true, memberId: member._id })
  } catch (err: any) {
    console.error('Profile save error:', err)
    return NextResponse.json({ error: err.message || 'Profile save failed' }, { status: 500 })
  }
}
