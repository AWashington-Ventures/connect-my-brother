import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const member = await Member.findOne({ email: email.toLowerCase() })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    member.passwordHash = passwordHash
    // Clear mustChangePassword flag if set
    if (member.mustChangePassword) {
      member.mustChangePassword = false
    }
    await member.save()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('set-password error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to set password' }, { status: 500 })
  }
}
