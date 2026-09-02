'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function EventsUpgradePage() {
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
      const res = await fetch('/api/events/upgrade-checkout', {
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="mb-4"><img src="/cmb-logo.jpg" alt="" className="w-16 h-16 object-contain mx-auto" /></div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">Events Poster Account</h1>
          <p className="text-brass-dim">Post flyers, announcements, parties, weddings, and more to the entire Connect My Brother &amp; Connect My Sister network.</p>
        </div>

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
                <span className="text-brass font-serif text-5xl font-bold">$1</span>
                <span className="text-brass-dim text-lg">/month</span>
              </>
            ) : (
              <>
                <span className="text-brass font-serif text-5xl font-bold">$11</span>
                <span className="text-brass-dim text-lg">/year</span>
                <p className="text-green-400 text-xs font-semibold mt-1">Save $1 vs monthly — 1 month free!</p>
              </>
            )}
            <p className="text-brass-dim text-sm mt-2">Funds support the lodge and fraternal community.</p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              'Post event flyers with photos and details',
              'Visible to ALL Connect My Brother & Connect My Sister members',
              'Events appear in gallery and calendar view',
              'Weddings, parties, lodge events, announcements',
              'Searchable by keyword, date, and location',
              'Funds support lodge charitable programs',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-brass text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{feature}</span>
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
              ? 'Become an Events Poster — $11/year →'
              : 'Become an Events Poster — $1/month →'
            }
          </button>
        </div>

        <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
          <p className="text-brass-dim text-xs leading-relaxed">
            <strong className="text-brass">Disclaimer:</strong> A Washington Ventures LLC is not responsible for the accuracy of event listings. All events are posted by verified members. Buyers and attendees engage with event organizers directly.
          </p>
        </div>
      </div>
    </main>
  )
}
