import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import bcrypt from 'bcryptjs'

const FREE_UNTIL = new Date('2027-01-01T00:00:00Z')

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password, dues } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already has a fully registered account with a password
    const existing = await Member.findOne({ email: normalizedEmail })
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    if (existing) {
      // Account exists but no password — set the password now
      existing.passwordHash = passwordHash
      await existing.save()
      return NextResponse.json({ success: true, memberId: existing._id, isNew: false })
    }

    // Create new member record with credentials + dues card data
    const member = await Member.create({
      email: normalizedEmail,
      passwordHash,
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
    })

    return NextResponse.json({ success: true, memberId: member._id, isNew: true })
  } catch (err: any) {
    console.error('Create account error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create account.' }, { status: 500 })
  }
}
