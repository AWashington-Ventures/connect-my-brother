'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import BBBStatusBadge from '@/components/BBBStatusBadge'

// Auto-convert Cloudinary URLs to browser-compatible format (fixes HEIC/HEIF)
function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

const CATEGORIES = [
  'All Categories',
  'Auto & Transportation',
  'Construction & Home Repair',
  'Catering & Food',
  'Clothing & Apparel',
  'Consulting & Professional Services',
  'Education & Tutoring',
  'Electronics & Technology',
  'Event Services',
  'Financial & Insurance',
  'Fitness & Wellness',
  'Funeral & Memorial Services',
  'General Merchandise',
  'Hair & Beauty',
  'Legal Services',
  'Landscaping & Outdoor',
  'Masonic Goods & Regalia',
  'Media & Photography',
  'Moving & Storage',
  'Music & Entertainment',
  'Real Estate',
  'Security Services',
  'Other',
]

export default function MarketplacePage() {
  const { status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/member/me').then(r => r.json()),
        fetch('/api/listings').then(r => r.json()),
      ]).then(([memberData, listingData]) => {
        if (memberData.member) setMember(memberData.member)
        if (listingData.listings) setListings(listingData.listings)
      }).finally(() => setLoading(false))
    }
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  const isSeller = member?.marketplaceTier === 'marketplace'

  const filtered = listings.filter(l => {
    const matchSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.sellerName?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All Categories' || l.category === category
    return matchSearch && matchCat
  })

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="font-serif font-bold text-brass text-3xl mb-1">🏪 Marketplace</h1>
            <p className="text-brass-dim text-sm">Goods and services from verified Mason businesses — trusted by the network.</p>
          </div>
          {isSeller && (
            <Link
              href="/seller/dashboard"
              className="btn-brass px-4 py-2 rounded-xl font-semibold text-sm flex-shrink-0"
            >
              My Listings →
            </Link>
          )}
        </div>

        {/* Seller upgrade CTA — only for non-sellers */}
        {!isSeller && (
          <div className="card-cmb rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="text-3xl">🏪</div>
            <div className="flex-1">
              <p className="text-brass font-semibold text-sm">Own a business? List your goods & services here.</p>
              <p className="text-brass-dim text-xs">$2/month — verified Mason sellers only. Supports the lodge.</p>
            </div>
            <Link href="/marketplace/upgrade" className="btn-brass px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0">
              Become a Seller →
            </Link>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-purple-dark/60 border border-brass-cmb/30 rounded-xl px-4 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-purple-dark/60 border border-brass-cmb/30 rounded-xl px-4 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Listings grid */}
        {filtered.length === 0 ? (
          <div className="card-cmb rounded-2xl p-12 text-center mb-8">
            {listings.length === 0 ? (
              <>
                <div className="text-5xl mb-4">🔨</div>
                <h2 className="font-serif font-bold text-brass text-xl mb-2">Be the First to List!</h2>
                <p className="text-brass-dim text-sm mb-2">No listings yet — the marketplace is open for business.</p>
                <p className="text-brass-dim text-xs">All sellers are verified Mason business owners with valid licenses.</p>
                {isSeller && (
                  <Link href="/seller/listings/new" className="inline-block mt-6 btn-brass px-6 py-3 rounded-xl font-serif font-bold">
                    Create First Listing →
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="font-serif font-bold text-brass text-xl mb-2">No Results</h2>
                <p className="text-brass-dim text-sm">Try adjusting your search or category filter.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {filtered.map((listing) => (
              <Link key={listing._id} href={`/marketplace/${listing._id}`} className="card-cmb rounded-2xl overflow-hidden hover:border-brass-cmb/60 transition-all block cursor-pointer">
                {/* Image */}
                <div className="w-full h-40 bg-brass-cmb/10 flex items-center justify-center overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={cloudinaryAutoFormat(listing.images[0])}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-serif font-bold text-brass text-base leading-tight mb-1 line-clamp-2">{listing.title}</h3>
                  <p className="text-brass-dim text-xs mb-2">{listing.category} · {listing.location}</p>
                  <p className="text-brass-dim text-xs mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brass font-bold text-lg">${listing.price?.toFixed(2)}</span>
                    <span className="text-brass-dim text-xs">{listing.sellerName}</span>
                  </div>
                  {listing.condition && listing.condition !== 'service' && (
                    <p className="text-brass-dim/60 text-xs mt-1">Condition: {listing.condition.replace('_', ' ')}</p>
                  )}
                  {listing.sellerBbbStatus && listing.sellerBbbStatus !== 'not_checked' && (
                    <div className="mt-2">
                      <BBBStatusBadge status={listing.sellerBbbStatus} showLabel={true} />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
          <p className="text-brass-dim text-xs leading-relaxed">
            <strong className="text-brass">Disclaimer:</strong> A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold through this platform. All transactions are solely between the buyer and the seller. Buyers are responsible for arranging shipping directly with the seller following purchase.
          </p>
        </div>

      </div>
    </main>
  )
}
