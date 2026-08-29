import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'

export const dynamic = 'force-dynamic'

// Extract BBB search state from HTML response
function extractBBBState(html: string): any | null {
  try {
    const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]+?\});/)
    if (!match) return null
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessName, location } = await req.json()
    if (!businessName?.trim()) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 })
    }

    await connectDB()
    const member = await Member.findOne({ email: session.user.email })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const searchLocation = location || member.cityState || 'Washington DC'
    const encodedName = encodeURIComponent(businessName.trim())
    const encodedLocation = encodeURIComponent(searchLocation)
    const bbbUrl = `https://www.bbb.org/search?find_text=${encodedName}&find_loc=${encodedLocation}`

    let bbbStatus: 'clear' | 'flagged' | 'not_found' | 'not_checked' = 'not_checked'
    let bbbData: any = null

    try {
      const res = await fetch(bbbUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(10000),
      })

      const html = await res.text()
      const state = extractBBBState(html)

      if (!state) {
        bbbStatus = 'not_checked'
      } else {
        const results = state?.searchResult?.results || []
        const totalResults = state?.searchResult?.totalResults || 0

        if (totalResults === 0 || results.length === 0) {
          // Not found in BBB directory
          bbbStatus = 'not_found'
        } else {
          // Found — check first result for rating and complaints
          const topResult = results[0]
          const rating = topResult?.rating || ''
          const isAccredited = topResult?.isAccredited || false
          const numComplaints = topResult?.numComplaints || 0
          const numReviews = topResult?.numReviews || 0
          const isOutOfBusiness = topResult?.isOutOfBusiness || false

          bbbData = {
            name: topResult?.businessName || businessName,
            rating,
            isAccredited,
            numComplaints,
            numReviews,
            isOutOfBusiness,
            profileUrl: topResult?.profileUrl
              ? `https://www.bbb.org${topResult.profileUrl}`
              : null,
          }

          // Determine status:
          // flagged = out of business, F or NR rating, or 5+ unresolved complaints
          // clear = everything else
          const badRatings = ['F', 'NR']
          if (
            isOutOfBusiness ||
            badRatings.includes(rating.toUpperCase()) ||
            numComplaints >= 5
          ) {
            bbbStatus = 'flagged'
          } else {
            bbbStatus = 'clear'
          }
        }
      }
    } catch (fetchErr: any) {
      console.error('BBB fetch error:', fetchErr.message)
      // Network/timeout — mark as not_checked rather than fail onboarding
      bbbStatus = 'not_checked'
    }

    // Update member record
    await Member.findByIdAndUpdate(member._id, {
      bbbCheckStatus: bbbStatus,
      bbbCheckDate: new Date(),
      ...(bbbData ? { bbbData: JSON.stringify(bbbData) } : {}),
    })

    return NextResponse.json({
      success: true,
      status: bbbStatus,
      data: bbbData,
    })
  } catch (err: any) {
    console.error('BBB check error:', err)
    return NextResponse.json({ error: err.message || 'BBB check failed' }, { status: 500 })
  }
}
