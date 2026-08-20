import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Member from '@/models/Member'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { brotherId, senderEmail, message } = await req.json()

    const brother = await Member.findById(brotherId).select('fullName email lodgeName lodgeNumber')
    if (!brother) return NextResponse.json({ error: 'Brother not found' }, { status: 404 })

    await resend.emails.send({
      from: 'Connect My Brother <connect@connectmybrother.com>',
      to: brother.email,
      replyTo: senderEmail,
      subject: `Connect My Brother — Someone is reaching out to you`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #3D1A6B; color: #F5F0E8; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4AA70; font-size: 24px; margin-bottom: 8px;">Connect My Brother</h1>
            <div style="height: 2px; background: linear-gradient(90deg, transparent, #B08D57, transparent);"></div>
          </div>
          <h2 style="color: #D4AA70;">Greetings, Brother ${brother.fullName.split(' ')[0]}!</h2>
          <p style="color: #E0D8F0; line-height: 1.6;">
            A fellow Master Mason is reaching out to you through the Connect My Brother network.
          </p>
          ${message ? `
          <div style="background: rgba(176, 141, 87, 0.15); border: 1px solid #B08D57; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #D4AA70; font-size: 12px; margin-bottom: 8px; font-weight: bold;">THEIR MESSAGE:</p>
            <p style="color: #F5F0E8; line-height: 1.6;">${message}</p>
          </div>` : ''}
          <p style="color: #B8A8D4; font-size: 14px;">
            To respond, simply reply to this email. Your reply will go directly to the brother who reached out.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(176, 141, 87, 0.3); text-align: center;">
            <p style="color: #B08D57; font-size: 12px;">Connect My Brother | connectmybrother.com</p>
            <p style="color: #6B5A8A; font-size: 11px;">A private network for verified Master Masons only.</p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Connect email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
