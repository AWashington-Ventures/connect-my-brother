import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const members = await Member.find(
      { subscriptionStatus: 'active' },
      {
        fullName: 1,
        lodgeName: 1,
        lodgeNumber: 1,
        grandLodge: 1,
        cityState: 1,
        profilePicture: 1,
        skills: 1,
        bio: 1,
        memberSince: 1,
      }
    ).sort({ memberSince: 1 }).lean()
    return NextResponse.json({ members })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
