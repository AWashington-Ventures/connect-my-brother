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
        {/* Masonic Square & Compass Watermark */}
        <div className="cmb-watermark" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
