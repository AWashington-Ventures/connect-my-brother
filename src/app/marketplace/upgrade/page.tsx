'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function MarketplaceUpgradePage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/marketplace/upgrade-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Unable to start checkout. Please try again.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">CMB Marketplace Seller</h1>
          <p className="text-brass-dim">List your business, goods, and services to the entire verified Mason network.</p>
        </div>

        {/* Pricing Card */}
        <div className="card-cmb rounded-2xl p-8 mb-6">

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-brass text-navy'
                  : 'bg-transparent border border-brass-cmb/40 text-brass-dim'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-brass text-navy'
                  : 'bg-transparent border border-brass-cmb/40 text-brass-dim'
              }`}
            >
              Annual <span className="text-green-400">Save 10%</span>
            </button>
          </div>

          <div className="text-center mb-6">
            {billingPeriod === 'monthly' ? (
              <>
                <span className="text-brass font-serif text-5xl font-bold">$2</span>
                <span className="text-brass-dim text-lg">/month</span>
              </>
            ) : (
              <>
                <span className="text-brass font-serif text-5xl font-bold">$22</span>
                <span className="text-brass-dim text-lg">/year</span>
                <p className="text-green-400 text-xs font-semibold mt-1">Save $2 vs monthly — 1 month free!</p>
              </>
            )}
            <p className="text-brass-dim text-sm mt-2">No transaction fees from AWV. You keep your full sale proceeds minus Stripe processing. Funds support the lodge.</p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              'Create business listings with photos & descriptions',
              'Accept payments directly through the CMB platform',
              'Visible to all verified Connect My Brother & Connect My Sister members',
              'Seller dashboard — track orders & revenue',
              'Verified Mason seller badge on your profile',
              'No AWV transaction fees — subscription only',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-brass text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-serif font-bold text-brass text-sm mb-3 uppercase tracking-wide">Seller Verification Required</h3>
          <ul className="space-y-2 mb-8">
            {[
              'Valid business license (submitted at checkout)',
              'Automated BBB standing check',
              'Agreement to marketplace terms & disclaimer',
            ].map((req) => (
              <li key={req} className="flex items-start gap-3 text-brass-dim text-sm">
                <span className="text-brass-cmb mt-0.5">○</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Redirecting to Checkout...'
              : billingPeriod === 'annual'
              ? 'Upgrade to Marketplace Seller — $22/year →'
              : 'Upgrade to Marketplace Seller — $2/month →'
            }
          </button>
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
