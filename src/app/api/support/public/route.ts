import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Connect My Brother <support@connectmybrother.com>',
      to: ['ahwashington@guardianpathdc.com'],
      replyTo: email,
      subject: `[CMB Public Support] ${subject}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #2D1B69; color: #D4B896; padding: 24px; border-radius: 12px;">
          <h2 style="color: #C9A84C; margin-bottom: 8px;">🏛️ Connect My Brother — Public Support Request</h2>
          <hr style="border-color: #C9A84C; opacity: 0.3; margin-bottom: 16px;" />
          <p><strong style="color: #C9A84C;">From:</strong> ${name} (${email})</p>
          <p><strong style="color: #C9A84C;">Subject:</strong> ${subject}</p>
          <hr style="border-color: #C9A84C; opacity: 0.3; margin: 16px 0;" />
          <p><strong style="color: #C9A84C;">Message:</strong></p>
          <p style="white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 3px solid #C9A84C;">${message}</p>
          <hr style="border-color: #C9A84C; opacity: 0.3; margin-top: 24px;" />
          <p style="font-size: 12px; opacity: 0.6;">Reply directly to this email to respond to the member.</p>
        </div>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
