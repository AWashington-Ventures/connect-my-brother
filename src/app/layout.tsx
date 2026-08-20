import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connect My Brother | Master Mason Network',
  description: 'A private, verified professional network exclusively for Master Masons. Connect with skilled brothers nationwide.',
  keywords: 'Masonic network, Master Mason, Prince Hall, brotherhood, professional network',
  openGraph: {
    title: 'Connect My Brother',
    description: 'The verified professional network for Master Masons',
    url: 'https://connectmybrother.com',
    siteName: 'Connect My Brother',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-purple-dark relative">
        {/* Square & Compass Watermark */}
        <div className="cmb-watermark">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Square */}
            <rect x="50" y="80" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="8" />
            {/* Compass legs */}
            <line x1="100" y1="20" x2="40" y2="140" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <line x1="100" y1="20" x2="160" y2="140" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            {/* G */}
            <text x="100" y="118" textAnchor="middle" fontSize="36" fontFamily="Georgia" fontWeight="bold" fill="currentColor">G</text>
            {/* Stars */}
            <circle cx="100" cy="20" r="5" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
