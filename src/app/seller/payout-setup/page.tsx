'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Suspense } from 'react'

function PayoutSetupContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRefresh = searchParams.get('refresh') === 'true'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectStatus, setConnectStatus] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/stripe/connect/status')
        .then(r => r.json())
        .then(data => setConnectStatus(data))
        .catch(() => {})
        .finally(() => setCheckingStatus(false))
    }
  }, [status, router])

  const handleSetupPayouts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/connect/onboard', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'pending_review') {
        setError('pending_review')
      } else {
        setError(data.error || 'Unable to start payout setup. Please try again.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="max-w-lg mx-auto mt-24 text-center">
        <p className="text-brass font-serif text-xl">Checking payout status...</p>
      </div>
    )
  }

  const isOnboarded = connectStatus?.onboarded && connectStatus?.chargesEnabled

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏦</div>
        <h1 className="font-serif font-bold text-brass text-3xl mb-2">Payout Setup</h1>
        <p className="text-brass-dim text-sm">Connect your bank account to receive payments from marketplace sales.</p>
      </div>

      {isOnboarded ? (
        <div className="card-cmb rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✅</span>
            <div>
              <h2 className="font-serif font-bold text-brass text-lg">Payouts Active</h2>
              <p className="text-brass-dim text-sm">Your bank account is connected. You'll receive payouts automatically after each sale.</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-brass-dim">Payments enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-brass-dim">Bank payouts enabled</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-cmb rounded-2xl p-6 mb-6">
          {isRefresh && (
            <div className="bg-amber-900/20 border border-amber-500/40 rounded-lg p-3 mb-4 text-amber-400 text-sm">
              Your payout setup session expired. Please restart the process below.
            </div>
          )}

          <h2 className="font-serif font-bold text-brass text-lg mb-4">How it works</h2>
          <ul className="space-y-3 mb-6">
            {[
              'Click "Set Up Payouts" below — you\'ll be redirected to Stripe',
              'Enter your bank account or debit card information securely',
              'Stripe verifies your identity (takes ~2 minutes)',
              'You\'re done — receive direct deposits after every sale',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-brass text-sm">
                <span className="text-brass-cmb font-bold mt-0.5">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-3 mb-6">
            <p className="text-brass-dim text-xs leading-relaxed">
              🔒 <strong className="text-brass">Powered by Stripe.</strong> Connect My Brother never sees or stores your banking information. Stripe handles all payment processing and direct deposits securely.
            </p>
          </div>

          {error === 'pending_review' ? (
            <div className="rounded-xl bg-amber-900/20 border border-amber-500/40 p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="text-amber-300 font-semibold text-sm mb-1">Payout Setup In Progress</p>
                  <p className="text-amber-200/80 text-xs leading-relaxed">Your seller account is being finalized. Our team will contact you within 24 hours to complete your bank account connection. No action needed on your part.</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          ) : null}

          {error !== 'pending_review' && (
            <button
              onClick={handleSetupPayouts}
              disabled={loading}
              className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Redirecting to Stripe...' : '🏦 Set Up Payouts →'}
            </button>
          )}
        </div>
      )}

      <div className="text-center">
        <Link href="/seller/dashboard" className="text-brass-dim text-sm underline">
          ← Back to Seller Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function PayoutSetupPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-lg mx-auto mt-24 text-center">
          <p className="text-brass font-serif text-xl">Loading...</p>
        </div>
      }>
        <PayoutSetupContent />
      </Suspense>
    </main>
  )
}
