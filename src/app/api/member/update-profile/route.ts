import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const { bio, website, skillsRaw, profilePicture } = await req.json()

    // Parse skills from raw input
    const skills = skillsRaw
      ? skillsRaw.split(/[,;:]+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean)
      : []

    const member = await Member.findOneAndUpdate(
      { email: session.user.email },
      { bio, website, skillsRaw: skillsRaw || '', skills, ...(profilePicture && { profilePicture }) },
      { new: true }
    )
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ success: true, member })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
