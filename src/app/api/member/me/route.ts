import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const member = await Member.findOne({ email: session.user.email })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
