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
    const { bio, website, skillsRaw, profilePicture, photos, videos, websites } = await req.json()

    // Parse skills from raw input
    const skills = skillsRaw
      ? skillsRaw.split(/[,;:]+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean)
      : []

    const updateData: any = {
      bio: bio || '',
      skillsRaw: skillsRaw || '',
      skills,
    }

    if (website !== undefined) updateData.website = website
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (photos !== undefined) updateData.photos = photos.filter((p: string) => p.trim())
    if (videos !== undefined) updateData.videos = videos.filter((v: string) => v.trim())
    if (websites !== undefined) updateData.websites = websites.filter((w: any) => w.url && w.url.trim())

    const member = await Member.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    )
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ success: true, member })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save' }, { status: 500 })
  }
}
