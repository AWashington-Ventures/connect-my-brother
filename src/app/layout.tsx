import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Connect My Brother | Master Mason Network',
  description: 'A private, verified professional network exclusively for Master Masons. Connect with skilled brothers nationwide.',
  keywords: 'Masonic network, Master Mason, Prince Hall, brotherhood, professional network',
  openGraph: {
    title: 'Connect My Brother',
    description: 'The verified professional network for Master Masons',
    url: 'https://connectmybrother.com',
    siteName: 'Connect My Brother',
    images: [
      {
        url: 'https://res.cloudinary.com/weywf5mi/image/upload/v1787208482/og_image.jpg',
        width: 1200,
        height: 630,
        alt: 'Connect My Brother — The Private Network for Master Masons',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connect My Brother',
    description: 'The verified professional network for Master Masons',
    images: ['https://res.cloudinary.com/weywf5mi/image/upload/v1787208482/og_image.jpg'],
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
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
