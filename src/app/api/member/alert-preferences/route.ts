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
    const member = await Member.findOne({ email: session.user.email }, { alertPreferences: 1 })
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

    const prefs = member.alertPreferences || {
      newEvent: true,
      newMarketplaceListing: true,
      newJobListing: true,
    }
    return NextResponse.json({ alertPreferences: prefs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    const { newEvent, newMarketplaceListing, newJobListing } = body

    const update: any = {}
    if (typeof newEvent === 'boolean') update['alertPreferences.newEvent'] = newEvent
    if (typeof newMarketplaceListing === 'boolean') update['alertPreferences.newMarketplaceListing'] = newMarketplaceListing
    if (typeof newJobListing === 'boolean') update['alertPreferences.newJobListing'] = newJobListing

    await Member.updateOne(
      { email: session.user.email },
      { $set: update }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
