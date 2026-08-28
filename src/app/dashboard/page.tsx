'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetch('/api/member/me')
        .then(r => r.json())
        .then(data => { if (data.member) setMember(data.member) })
        .catch(() => {})
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  // Build lodge display: "Ionic Lodge #17" if number exists, else "Ionic Lodge"
  const lodgeDisplay = member
    ? `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}`
    : ''

  const isMarketplaceSeller = member?.marketplaceTier === 'marketplace'

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      {/* Dashboard top nav bar */}
      <div className="max-w-2xl mx-auto flex justify-end mb-4 pt-2">
        <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-brass-cmb/40 bg-brass-cmb/10 text-brass font-serif font-semibold text-sm hover:border-brass-cmb/80 hover:bg-brass-cmb/20 transition-all">
          🔍 Find a Brother
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-20 h-auto rounded-xl" />
          </div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">
            Welcome, Brother {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-brass-dim">
            {lodgeDisplay ? `${lodgeDisplay} — Verified Master Mason` : 'Verified Master Mason'}
          </p>
        </div>

        {/* Marketplace Prompt Card — shown to basic tier members only */}
        {member && !isMarketplaceSeller && (
          <div className="mb-4 rounded-2xl border-2 border-brass-cmb/60 bg-brass-cmb/5 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏪</div>
              <div className="flex-1">
                <h2 className="font-serif font-bold text-brass text-lg mb-1">Do You Own a Business?</h2>
                <p className="text-brass-dim text-sm mb-3">
                  List your goods and services on the CMB Marketplace — available to all verified members. Get discovered by brothers across the network.
                </p>
                <ul className="text-brass-dim text-xs mb-4 space-y-1">
                  <li>✅ List products, services &amp; goods for sale</li>
                  <li>✅ Accept payments directly through the site</li>
                  <li>✅ Verified Mason sellers only — trusted network</li>
                  <li>✅ $2/month add-on — funds support the lodge</li>
                </ul>
                <Link
                  href="/marketplace/upgrade"
                  className="inline-block btn-brass px-5 py-2 rounded-lg text-sm font-semibold"
                >
                  Become a Marketplace Seller →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Seller Badge — shown to marketplace tier members */}
        {member && isMarketplaceSeller && (
          <div className="mb-4 rounded-2xl border border-green-500/40 bg-green-900/10 p-4 flex items-center gap-4">
            <div className="text-3xl">🏅</div>
            <div className="flex-1">
              <p className="text-green-400 font-semibold text-sm">Marketplace Seller Account Active</p>
              <p className="text-brass-dim text-xs">Your listings are visible to all CMB members.</p>
            </div>
            <Link href="/seller/dashboard" className="text-brass text-xs underline">Manage Listings</Link>
          </div>
        )}

        {/* Events Prompt Card — shown to viewer tier members */}
        {member && member.eventsTier !== 'poster' && (
          <div className="mb-4 rounded-2xl border border-brass-cmb/40 bg-brass-cmb/5 p-5">
            <div className="flex items-start gap-4">
              <img src="/cmb-logo.jpg" alt="" className="w-10 h-10 object-contain rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-serif font-bold text-brass text-base mb-1">Share Events with the Network</h2>
                <p className="text-brass-dim text-sm mb-3">Post flyers, lodge events, parties, weddings & announcements — visible to all Connect My Brother & Connect My Sister members.</p>
                <Link href="/events/upgrade" className="inline-block btn-brass px-4 py-2 rounded-lg text-xs font-semibold">Post Events — $1/month →</Link>
              </div>
              <Link href="/events" className="text-brass text-xs underline whitespace-nowrap">Browse Events</Link>
            </div>
          </div>
        )}

        {/* Events Poster Badge */}
        {member && member.eventsTier === 'poster' && (
          <div className="mb-4 rounded-2xl border border-brass-cmb/40 bg-brass-cmb/5 p-4 flex items-center gap-4">
            <img src="/cmb-logo.jpg" alt="" className="w-10 h-10 object-contain rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <p className="text-brass font-semibold text-sm">Events Poster Account Active</p>
              <p className="text-brass-dim text-xs">Post unlimited events to the CMB & CMS network.</p>
            </div>
            <Link href="/events/post" className="text-brass text-xs underline">Post Event</Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Link href="/search" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all text-center block">
            <div className="text-3xl mb-3">🔍</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-1">Search My Brothers</h2>
            <p className="text-brass-dim text-sm">Find brothers by skill or service</p>
          </Link>
          <Link href="/brothers" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all text-center block">
            <div className="text-3xl mb-3">🏛️</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-1">Member Directory</h2>
            <p className="text-brass-dim text-sm">Browse all verified members</p>
          </Link>
        </div>

        <div className="mb-4">
          <Link href="/marketplace" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all flex items-center gap-4 block">
            <div className="text-3xl">🏪</div>
            <div>
              <h2 className="font-serif font-bold text-brass text-lg mb-1">Marketplace</h2>
              <p className="text-brass-dim text-sm">Shop goods and services from verified Mason businesses</p>
            </div>
          </Link>
        </div>

        <div className="mb-4">
          <Link href="/support" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all flex items-center gap-4 block">
            <div className="text-3xl">🙋</div>
            <div>
              <h2 className="font-serif font-bold text-brass text-lg mb-1">Help &amp; Support</h2>
              <p className="text-brass-dim text-sm">Report an issue or ask a question</p>
            </div>
          </Link>
        </div>

        <div className="mb-4">
          <Link href="/account/profile" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all flex items-center gap-4 block">
            <div className="text-3xl">✏️</div>
            <div>
              <h2 className="font-serif font-bold text-brass text-lg mb-1">Edit My Profile</h2>
              <p className="text-brass-dim text-sm">Add bio, skills, and keywords for the directory</p>
            </div>
          </Link>
        </div>

        <div className="card-cmb rounded-2xl p-6 mb-4">
          <h2 className="font-serif font-bold text-brass text-lg mb-3">My Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brass-dim">Name</span>
              <span className="text-brass">{member?.fullName || session?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Lodge</span>
              <span className="text-brass">{lodgeDisplay || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Grand Lodge</span>
              <span className="text-brass">{member?.grandLodge || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Email</span>
              <span className="text-brass">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Membership</span>
              <span className="text-green-400">Active — $5/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Marketplace</span>
              <span className={isMarketplaceSeller ? 'text-green-400' : 'text-brass-dim'}>
                {isMarketplaceSeller ? 'Seller — $2/month ✅' : 'Basic (Browse & Buy)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Events</span>
              <span className={member?.eventsTier === 'poster' ? 'text-green-400' : 'text-brass-dim'}>
                {member?.eventsTier === 'poster' ? 'Events Poster — $1/month ✅' : 'Viewer (Browse Only)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Status</span>
              <span className="text-brass">Verified Master Mason ✅</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-2 text-sm text-brass-dim hover:text-brass border border-brass-cmb/20 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}
