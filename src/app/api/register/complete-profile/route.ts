import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import Stripe from 'stripe'
import { sendAdminSubscriptionAlert } from '@/lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Free founding member period: all registrations are free until Jan 1, 2027
const FREE_UNTIL = new Date('2027-01-01T00:00:00Z')

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

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Payment verification required. Please complete checkout first.' },
        { status: 400 }
      )
    }

    // FREE FOUNDING MEMBER PATH — valid only until Jan 1, 2027
    if (sessionId === 'FREE_2027') {
      if (new Date() >= FREE_UNTIL) {
        return NextResponse.json(
          { error: 'The free founding member period has ended. Please complete payment to register.' },
          { status: 402 }
        )
      }

      const verifiedEmail = (email || '').toLowerCase()
      if (!verifiedEmail) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
      }

      const skills = parseSkills(skillsRaw || '')

      // Handle page refresh (member already exists)
      const existing = await Member.findOne({ email: verifiedEmail })
      if (existing) {
        existing.bio = bio
        existing.website = website
        existing.skills = skills
        existing.skillsRaw = skillsRaw
        if (profilePicture) existing.profilePicture = profilePicture
        if (!existing.subscriptionStatus || existing.subscriptionStatus !== 'active') {
          existing.subscriptionStatus = 'active'
        }
        existing.freeUntil = FREE_UNTIL
        await existing.save()
        return NextResponse.json({ success: true, memberId: existing._id })
      }

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
        freeUntil: FREE_UNTIL,
        bio,
        website,
        skills,
        skillsRaw,
        profilePicture: profilePicture || '',
      })

      // Notify admin of new founding member (non-blocking)
      sendAdminSubscriptionAlert({
        platform: 'cmb',
        subscriptionType: 'new_member',
        memberName: member.fullName,
        memberEmail: verifiedEmail,
        lodgeName: member.lodgeName ? `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}` : undefined,
        amount: 'FREE (Founding Member — until Jan 1, 2027)',
      }).catch(() => {})

      return NextResponse.json({ success: true, memberId: member._id })
    }

    // PAID PATH — Verify Stripe session
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

    const verifiedEmail = (stripeSession.customer_email || email || '').toLowerCase()
    if (!verifiedEmail) {
      return NextResponse.json(
        { error: 'Email not found in payment session.' },
        { status: 400 }
      )
    }

    const stripeCustomerId = typeof stripeSession.customer === 'string'
      ? stripeSession.customer
      : stripeSession.customer?.id || ''

    const stripeSubscriptionId = typeof stripeSession.subscription === 'string'
      ? stripeSession.subscription
      : (stripeSession.subscription as Stripe.Subscription)?.id || ''

    const skills = parseSkills(skillsRaw || '')

    const existing = await Member.findOne({ email: verifiedEmail })
    if (existing) {
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
