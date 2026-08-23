import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth guard — verified members only
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const member = await Member.findById(params.id)
      .select('-email -stripeCustomerId -stripeSubscriptionId -passwordHash -cardVoidDate -cardIssuedDate -grandSecretary -duesCardVerified')
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
