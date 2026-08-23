import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function GET(req: NextRequest) {
  try {
    // Auth guard — verified members only
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const q = req.nextUrl.searchParams.get('q') || ''
    if (!q.trim()) return NextResponse.json({ members: [] })

    const terms = q.trim().toLowerCase()

    const members = await Member.find({
      subscriptionStatus: 'active',
      $or: [
        { skills: { $in: [new RegExp(terms, 'i')] } },
        { skillsRaw: new RegExp(terms, 'i') },
        { fullName: new RegExp(terms, 'i') },
        { lodgeName: new RegExp(terms, 'i') },
        { cityState: new RegExp(terms, 'i') },
        { bio: new RegExp(terms, 'i') },
      ]
    }).select('fullName lodgeName lodgeNumber cityState skills profilePicture bio').limit(50)

    return NextResponse.json({ members })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
