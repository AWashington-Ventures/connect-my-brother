import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

function parseSkills(raw: string): string[] {
  return raw
    .split(/[,;:]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.toLowerCase())
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { dues, email, bio, website, skillsRaw, profilePicture } = body

    const skills = parseSkills(skillsRaw || '')

    // Check if member already exists
    const existing = await Member.findOne({ email })
    if (existing) {
      // Update profile
      existing.bio = bio
      existing.website = website
      existing.skills = skills
      existing.skillsRaw = skillsRaw
      if (profilePicture) existing.profilePicture = profilePicture
      await existing.save()
      return NextResponse.json({ success: true, memberId: existing._id })
    }

    // Create new member
    const member = await Member.create({
      email,
      fullName: dues.fullName,
      lodgeName: dues.lodgeName,
      lodgeNumber: dues.lodgeNumber,
      grandLodge: dues.grandLodge,
      cityState: dues.cityState,
      cardIssuedDate: `${dues.issuedDate} 20${dues.issuedYear}`,
      cardVoidDate: `${dues.voidDate} 20${dues.voidYear}`,
      grandSecretary: dues.grandSecretary,
      duesCardVerified: true,
      subscriptionStatus: 'active',
      bio, website, skills, skillsRaw,
      profilePicture: profilePicture || '',
    })

    return NextResponse.json({ success: true, memberId: member._id })
  } catch (err: any) {
    console.error('Profile save error:', err)
    return NextResponse.json({ error: err.message || 'Profile save failed' }, { status: 500 })
  }
}
