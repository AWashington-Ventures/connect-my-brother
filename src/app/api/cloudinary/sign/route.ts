import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    // Auth guard — only verified members can upload
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const CLOUD_API_SECRET = process.env.CLOUDINARY_API_SECRET
    const CLOUD_API_KEY = process.env.CLOUDINARY_API_KEY

    if (!CLOUD_API_SECRET || !CLOUD_API_KEY) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cmb_uploads'

    // Build the signature string: sorted params + api_secret
    // Cloudinary signature: SHA1(sorted_params_string + api_secret)
    const paramsToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}`
    const signature = createHash('sha1')
      .update(paramsToSign + CLOUD_API_SECRET)
      .digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: CLOUD_API_KEY,
      uploadPreset,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
