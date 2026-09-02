import { NextRequest, NextResponse } from 'next/server'
import { isRecognizedGrandLodge, isValidLodgeName } from '@/lib/grandLodgeValidator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { voidDate, voidYear, grandLodge, lodgeName, lodgeNumber } = body

    // 1. Validate Grand Lodge is a real, recognized Masonic body
    if (grandLodge && !isRecognizedGrandLodge(grandLodge)) {
      return NextResponse.json(
        { error: 'invalid_lodge', message: 'The Grand Lodge entered could not be verified as a recognized Masonic jurisdiction.' },
        { status: 403 }
      )
    }

    // 2. Validate lodge name is not obviously fake
    if (lodgeName && !isValidLodgeName(lodgeName, lodgeNumber || '')) {
      return NextResponse.json(
        { error: 'invalid_lodge', message: 'The Lodge name entered could not be verified.' },
        { status: 403 }
      )
    }

    // 3. Parse void date — card must not be expired
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
