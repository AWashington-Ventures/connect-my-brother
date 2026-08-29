'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import BBBStatusBadge from '@/components/BBBStatusBadge'

// Auto-convert Cloudinary HEIC/HEIF to browser-friendly format
function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

export default function SellerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/member/me').then(r => r.json()),
        fetch('/api/listings?mine=true').then(r => r.json()),
      ]).then(([memberData, listingData]) => {
        if (memberData.member) setMember(memberData.member)
        if (memberData.member?.marketplaceTier !== 'marketplace') {
          router.push('/marketplace/upgrade')
          return
        }
        if (listingData.listings) setListings(listingData.listings)
      }).finally(() => setLoading(false))
    }
  }, [status, router])

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing from the marketplace?')) return
    setDeletingId(id)
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setListings(prev => prev.filter(l => l._id !== id))
      setToast('Listing removed.')
      setTimeout(() => setToast(''), 3000)
    } else {
      setToast(data.error || 'Failed to delete listing.')
    }
    setDeletingId(null)
  }

  const handleTogglePause = async (listing: any) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active'
    const res = await fetch(`/api/listings/${listing._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (data.listing) {
      setListings(prev => prev.map(l => l._id === listing._id ? { ...l, status: newStatus } : l))
      setToast(newStatus === 'paused' ? 'Listing paused.' : 'Listing reactivated.')
      setTimeout(() => setToast(''), 3000)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  const activeCount = listings.filter(l => l.status === 'active').length
  const pausedCount = listings.filter(l => l.status === 'paused').length

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif font-bold text-brass text-2xl">My Listings</h1>
            <p className="text-brass-dim text-sm">Marketplace Seller Dashboard</p>
          </div>
          <Link
            href="/seller/listings/new"
            className="btn-brass px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + New Listing
          </Link>
        </div>

        {/* Payout Setup Banner */}
        {member && !member.stripeConnectOnboarded && (
          <div className="card-cmb rounded-xl p-4 mb-4 flex items-center justify-between gap-4 border border-amber-500/30">
            <div>
              <p className="text-brass text-sm font-semibold">🏦 Set up your payouts</p>
              <p className="text-brass-dim text-xs">Connect your bank account to receive payments from sales.</p>
            </div>
            <Link href="/seller/payout-setup" className="btn-brass px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0">
              Set Up →
            </Link>
          </div>
        )}

        {/* Business License Banner */}
        {member && !member.businessLicenseUrl && (
          <div className="card-cmb rounded-xl p-4 mb-4 flex items-center justify-between gap-4 border border-red-500/30">
            <div>
              <p className="text-brass text-sm font-semibold">📋 Upload your business license</p>
              <p className="text-brass-dim text-xs">Required to activate your seller account and list items.</p>
            </div>
            <Link href="/seller/onboarding" className="btn-brass px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0">
              Upload →
            </Link>
          </div>
        )}

        {/* BBB Check Status Banner */}
        <div className="card-cmb rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-brass text-sm font-semibold mb-1">BBB Standing Check</p>
            <p className="text-brass-dim text-xs">
              {member?.bbbCheckStatus === 'pending' && 'Your BBB check is in progress. This may take a few minutes.'}
              {member?.bbbCheckStatus === 'clear' && 'Your business passed the BBB standing check.'}
              {member?.bbbCheckStatus === 'flagged' && 'Your business was flagged in the BBB check. Please contact support.'}
              {member?.bbbCheckStatus === 'not_found' && 'Your business was not found in the BBB directory. Listings remain active.'}
              {member?.bbbCheckStatus === 'not_checked' && 'BBB check could not be completed. Listings remain active.'}
            </p>
            {member?.bbbCheckDate && (
              <p className="text-brass-dim/50 text-xs mt-1">
                Last checked: {new Date(member.bbbCheckDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <BBBStatusBadge status={member?.bbbCheckStatus || 'not_checked'} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-cmb rounded-xl p-3 text-center">
            <div className="text-brass font-bold text-xl">{listings.length}</div>
            <div className="text-brass-dim text-xs">Total</div>
          </div>
          <div className="card-cmb rounded-xl p-3 text-center">
            <div className="text-green-400 font-bold text-xl">{activeCount}</div>
            <div className="text-brass-dim text-xs">Active</div>
          </div>
          <div className="card-cmb rounded-xl p-3 text-center">
            <div className="text-amber-400 font-bold text-xl">{pausedCount}</div>
            <div className="text-brass-dim text-xs">Paused</div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 bg-green-900/20 border border-green-500/40 rounded-xl p-3 text-green-400 text-sm text-center">
            {toast}
          </div>
        )}

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="card-cmb rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="font-serif font-bold text-brass text-xl mb-2">No Listings Yet</h2>
            <p className="text-brass-dim text-sm mb-6">Create your first listing to start selling to verified Mason members across the network.</p>
            <Link href="/seller/listings/new" className="btn-brass px-6 py-3 rounded-xl font-serif font-bold">
              Create Your First Listing →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing._id} className="card-cmb rounded-2xl p-4">
                <div className="flex gap-4">
                  {/* Image thumbnail */}
                  {listing.images?.[0] ? (
                    <img
                      src={cloudinaryAutoFormat(listing.images[0])}
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-brass-cmb/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-brass text-base leading-tight">{listing.title}</h3>
                        <p className="text-brass-dim text-xs mt-0.5">{listing.category} · {listing.location}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-brass font-bold">${listing.price.toFixed(2)}</div>
                        <div className={`text-xs mt-0.5 ${
                          listing.status === 'active' ? 'text-green-400' :
                          listing.status === 'paused' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {listing.status === 'active' ? '● Active' :
                           listing.status === 'paused' ? '● Paused' : '● Removed'}
                        </div>
                      </div>
                    </div>

                    <p className="text-brass-dim text-xs mt-2 line-clamp-2">{listing.description}</p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => handleTogglePause(listing)}
                        className="text-xs text-brass underline hover:text-brass-dim transition-colors"
                      >
                        {listing.status === 'active' ? 'Pause' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        disabled={deletingId === listing._id}
                        className="text-xs text-red-400/70 underline hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        {deletingId === listing._id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-brass-dim text-sm underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
