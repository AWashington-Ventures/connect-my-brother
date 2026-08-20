import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { voidDate, voidYear } = body

    // Parse void date
    const currentYear = new Date().getFullYear() % 100 // last 2 digits
    const cardYear = parseInt(voidYear || '0')

    if (cardYear < currentYear) {
      return NextResponse.json(
        { error: `Your dues card expired in 20${voidYear}. Please renew your dues and try again.` },
        { status: 400 }
      )
    }

    // Card is valid
    return NextResponse.json({ valid: true, message: 'Dues card verified successfully.' })
  } catch (err: any) {
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
