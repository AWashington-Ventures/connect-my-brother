import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const member = await Member.findById(params.id)
      .select('-email -stripeCustomerId -stripeSubscriptionId')
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
