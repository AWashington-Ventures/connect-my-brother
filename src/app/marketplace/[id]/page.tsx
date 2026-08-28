'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

export default function ListingDetailPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [error, setError] = useState('')
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && params?.id) {
      fetch(`/api/listings/${params.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.listing) setListing(data.listing)
          else setError('Listing not found.')
        })
        .catch(() => setError('Failed to load listing.'))
        .finally(() => setLoading(false))
    }
  }, [status, params?.id, router])

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4">
        <Navbar />
        <div className="max-w-2xl mx-auto mt-10 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-brass-dim">{error || 'Listing not found.'}</p>
          <Link href="/marketplace" className="text-brass text-sm underline mt-4 inline-block">← Back to Marketplace</Link>
        </div>
      </main>
    )
  }

  const images = listing.images?.filter(Boolean) || []

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-6">

        {/* Back link */}
        <Link href="/marketplace" className="text-brass-dim text-sm underline mb-4 inline-block">← Back to Marketplace</Link>

        {/* Image gallery */}
        <div className="card-cmb rounded-2xl overflow-hidden mb-6">
          <div className="w-full h-64 sm:h-80 bg-brass-cmb/10 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                src={cloudinaryAutoFormat(images[activeImg])}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-7xl">📦</span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'border-brass-cmb' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={cloudinaryAutoFormat(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card-cmb rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-serif font-bold text-brass text-2xl leading-tight">{listing.title}</h1>
            <span className="text-brass font-bold text-2xl flex-shrink-0">${listing.price?.toFixed(2)}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-brass-cmb/20 text-brass text-xs px-3 py-1 rounded-full">{listing.category}</span>
            {listing.condition && listing.condition !== 'service' && (
              <span className="bg-brass-cmb/20 text-brass text-xs px-3 py-1 rounded-full">
                {listing.condition.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
            )}
            <span className="bg-brass-cmb/20 text-brass text-xs px-3 py-1 rounded-full">📍 {listing.location}</span>
          </div>

          <p className="text-brass-dim text-sm leading-relaxed mb-4">{listing.description}</p>

          <div className="flex items-center gap-2 text-brass-dim text-xs mb-4">
            <span>🏛️ Sold by <strong className="text-brass">{listing.sellerName}</strong></span>
            {listing.sellerLodge && <span>· {listing.sellerLodge}</span>}
          </div>

          {/* Shipping note */}
          <div className="rounded-xl bg-brass-cmb/10 border border-brass-cmb/20 p-3 text-xs text-brass-dim mb-4">
            📦 <strong className="text-brass">Shipping note:</strong> Buyer arranges and pays for shipping. Seller ships after payment is confirmed through the site.
          </div>
        </div>

        {/* Buy button — Stripe Checkout */}
        {buyError && (
          <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 mb-3 text-red-400 text-sm">
            {buyError}
          </div>
        )}
        <button
          className="w-full btn-brass py-4 rounded-2xl font-serif font-bold text-lg mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={buyLoading}
          onClick={async () => {
            setBuyLoading(true)
            setBuyError('')
            try {
              const res = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: params?.id }),
              })
              const data = await res.json()
              if (data.url) {
                window.location.href = data.url
              } else {
                setBuyError(data.error || 'Unable to start checkout. Please try again.')
              }
            } catch (e) {
              setBuyError('Something went wrong. Please try again.')
            } finally {
              setBuyLoading(false)
            }
          }}
        >
          {buyLoading ? '⏳ Redirecting to checkout...' : `Buy Now — $${listing.price?.toFixed(2)}`}
        </button>

        {/* Disclaimer */}
        <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
          <p className="text-brass-dim text-xs leading-relaxed">
            <strong className="text-brass">Disclaimer:</strong> A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold through this platform. All transactions are solely between the buyer and the seller.
          </p>
        </div>

      </div>
    </main>
  )
}
