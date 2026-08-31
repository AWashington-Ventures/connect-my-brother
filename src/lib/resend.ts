import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface AlertEmailPayload {
  to: string
  memberName: string
  alertType: 'newEvent' | 'newMarketplaceListing' | 'newJobListing'
  itemTitle: string
  itemDescription: string
  itemUrl: string
  platform: 'cmb' | 'cms'
}

const PLATFORM_CONFIG = {
  cmb: {
    name: 'Connect My Brother',
    from: 'Connect My Brother <alerts@connectmybrother.com>',
    color: '#7C3AED',
    accentColor: '#D4AF37',
    logo: 'https://connectmybrother.com/cmb-logo.png',
  },
  cms: {
    name: 'Connect My Sister',
    from: 'Connect My Sister <alerts@connectmysister.com>',
    color: '#7C3AED',
    accentColor: '#D4AF37',
    logo: 'https://connectmysister.com/cms-logo.png',
  },
}

const ALERT_LABELS = {
  newEvent: '📅 New Event Posted',
  newMarketplaceListing: '🛍 New Marketplace Listing',
  newJobListing: '💼 New Job Listing',
}

export async function sendAlertEmail(payload: AlertEmailPayload) {
  const config = PLATFORM_CONFIG[payload.platform]
  const label = ALERT_LABELS[payload.alertType]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label}</title>
</head>
<body style="margin:0;padding:0;background:#1a0a2e;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a2e;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#2d1b4e;border-radius:16px;border:1px solid ${config.accentColor}40;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid ${config.accentColor}30;">
              <p style="color:${config.accentColor};font-size:22px;font-weight:bold;margin:0;letter-spacing:1px;">${config.name}</p>
              <p style="color:#9b7ad4;font-size:13px;margin:8px 0 0;">Member Alert</p>
            </td>
          </tr>

          <!-- Alert badge -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;background:${config.accentColor}20;border:1px solid ${config.accentColor}60;color:${config.accentColor};padding:8px 20px;border-radius:20px;font-size:14px;font-weight:bold;">${label}</span>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="color:#d4c5f0;font-size:15px;margin:0;">Brother ${payload.memberName},</p>
              <p style="color:#b8a0e0;font-size:14px;margin:12px 0 0;line-height:1.6;">A new item has been posted on ${config.name} that you may be interested in.</p>
            </td>
          </tr>

          <!-- Item card -->
          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a2e;border:1px solid ${config.accentColor}40;border-radius:12px;padding:20px;">
                <tr>
                  <td>
                    <p style="color:${config.accentColor};font-size:16px;font-weight:bold;margin:0 0 8px;">${payload.itemTitle}</p>
                    <p style="color:#b8a0e0;font-size:13px;margin:0;line-height:1.6;">${payload.itemDescription.substring(0, 200)}${payload.itemDescription.length > 200 ? '...' : ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${payload.itemUrl}" style="display:inline-block;background:${config.accentColor};color:#1a0a2e;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">View Now →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;text-align:center;border-top:1px solid ${config.accentColor}20;">
              <p style="color:#6b4fa0;font-size:12px;margin:0;">You're receiving this because you have alerts enabled on ${config.name}.</p>
              <p style="color:#6b4fa0;font-size:12px;margin:6px 0 0;">Manage your alert preferences in your account settings.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return resend.emails.send({
    from: config.from,
    to: payload.to,
    subject: `${label}: ${payload.itemTitle}`,
    html,
  })
}

export async function sendAdminSubscriptionAlert({
  platform,
  subscriptionType,
  memberName,
  memberEmail,
  lodgeName,
  amount,
}: {
  platform: 'cmb' | 'cms'
  subscriptionType: 'new_member' | 'events_poster' | 'marketplace_seller'
  memberName: string
  memberEmail: string
  lodgeName?: string
  amount?: string
}) {
  const config = PLATFORM_CONFIG[platform]
  const adminEmail = platform === 'cmb'
    ? 'ahwashington@connectmybrother.com'
    : 'ahwashington@connectmysister.com'

  const typeLabels: Record<string, string> = {
    new_member: '🆕 New Member Subscription',
    events_poster: '📅 Events Poster Upgrade',
    marketplace_seller: '🛍 Marketplace Seller Upgrade',
  }
  const typeAmounts: Record<string, string> = {
    new_member: amount || '$5.00/month',
    events_poster: amount || '$1.00/month',
    marketplace_seller: amount || '$2.00/month',
  }

  const label = typeLabels[subscriptionType]
  const sub_amount = typeAmounts[subscriptionType]
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Subscription Alert</title></head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1a0a2e;border-radius:16px;border:2px solid ${config.accentColor};">
        <tr>
          <td style="padding:28px 36px 20px;text-align:center;border-bottom:1px solid ${config.accentColor}30;">
            <p style="color:${config.accentColor};font-size:13px;font-weight:bold;margin:0;letter-spacing:2px;text-transform:uppercase;">ADMIN ALERT — ${config.name}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 8px;text-align:center;">
            <span style="display:inline-block;background:${config.accentColor};color:#0f0a1e;padding:10px 24px;border-radius:20px;font-size:15px;font-weight:bold;">${label}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0a1e;border:1px solid ${config.accentColor}40;border-radius:12px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#d4c5f0;font-size:14px;margin:0 0 10px;"><strong style="color:${config.accentColor};">Member:</strong> ${memberName}</p>
                <p style="color:#d4c5f0;font-size:14px;margin:0 0 10px;"><strong style="color:${config.accentColor};">Email:</strong> ${memberEmail}</p>
                ${lodgeName ? `<p style="color:#d4c5f0;font-size:14px;margin:0 0 10px;"><strong style="color:${config.accentColor};">Lodge:</strong> ${lodgeName}</p>` : ''}
                <p style="color:#d4c5f0;font-size:14px;margin:0 0 10px;"><strong style="color:${config.accentColor};">Plan:</strong> ${sub_amount}</p>
                <p style="color:#d4c5f0;font-size:14px;margin:0;"><strong style="color:${config.accentColor};">Time:</strong> ${now} ET</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 28px;text-align:center;">
            <p style="color:#6b4fa0;font-size:11px;margin:0;">This is an automated admin alert from ${config.name}.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `

  return resend.emails.send({
    from: config.from,
    to: adminEmail,
    subject: `${label} — ${memberName} | ${config.name}`,
    html,
  })
}

export async function sendBulkAlerts({
  members,
  alertType,
  itemTitle,
  itemDescription,
  itemUrl,
  platform,
}: {
  members: { email: string; fullName: string }[]
  alertType: AlertEmailPayload['alertType']
  itemTitle: string
  itemDescription: string
  itemUrl: string
  platform: 'cmb' | 'cms'
}) {
  // Send in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize)
    await Promise.allSettled(
      batch.map(m =>
        sendAlertEmail({
          to: m.email,
          memberName: m.fullName,
          alertType,
          itemTitle,
          itemDescription,
          itemUrl,
          platform,
        })
      )
    )
  }
}
