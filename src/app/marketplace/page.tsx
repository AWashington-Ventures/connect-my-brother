'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function MarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">🏪 CMB Marketplace</h1>
          <p className="text-brass-dim">Goods and services from verified Mason businesses — trusted by the network.</p>
        </div>

        {/* Coming Soon State */}
        <div className="card-cmb rounded-2xl p-12 text-center mb-8">
          <div className="text-6xl mb-6">🔨</div>
          <h2 className="font-serif font-bold text-brass text-2xl mb-3">Marketplace Coming Soon</h2>
          <p className="text-brass-dim mb-2">
            The CMB Marketplace is being built. Verified Mason businesses will be able to list their goods and services here.
          </p>
          <p className="text-brass-dim text-sm mb-8">
            All sellers are verified — valid business license required, BBB standing checked.
          </p>
          <Link
            href="/marketplace/upgrade"
            className="inline-block btn-brass px-8 py-3 rounded-xl font-serif font-bold"
          >
            Become a Marketplace Seller →
          </Link>
        </div>

        {/* What to expect */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🔍', title: 'Browse Listings', desc: 'Search by category, location, and type' },
            { icon: '💳', title: 'Secure Payments', desc: 'Pay directly through the platform — powered by Stripe' },
            { icon: '🤝', title: 'Mason Verified', desc: 'Every seller is a dues-current verified Master Mason' },
          ].map(item => (
            <div key={item.title} className="card-cmb rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-serif font-bold text-brass text-sm mb-1">{item.title}</h3>
              <p className="text-brass-dim text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
          <p className="text-brass-dim text-xs leading-relaxed">
            <strong className="text-brass">Disclaimer:</strong> A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold through this platform. All transactions are solely between the buyer and the seller. Buyers are responsible for arranging shipping directly with the seller following purchase. A Washington Ventures LLC does not guarantee the accuracy of business listings or vetting results.
          </p>
        </div>
      </div>
    </main>
  )
}
