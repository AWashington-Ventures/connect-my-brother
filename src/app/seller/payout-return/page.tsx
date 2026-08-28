'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PayoutReturnPage() {
  const { status } = useSession()
  const router = useRouter()
  const [connectStatus, setConnectStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/stripe/connect/status')
        .then(r => r.json())
        .then(data => setConnectStatus(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, router])

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Checking your payout status...</div>
      </main>
    )
  }

  const isComplete = connectStatus?.chargesEnabled && connectStatus?.payoutsEnabled

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto mt-12 text-center">
        {isComplete ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-serif font-bold text-brass text-3xl mb-3">Payouts Active!</h1>
            <p className="text-brass-dim mb-2">Your bank account is connected and verified.</p>
            <p className="text-brass-dim text-sm mb-8">You'll receive direct deposits after every sale — no extra steps needed.</p>
            <div className="space-y-3">
              <Link href="/seller/dashboard" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Go to Seller Dashboard →</Link>
              <Link href="/seller/listings/new" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">Create a Listing</Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-6">⏳</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-3">Almost There</h1>
            <p className="text-brass-dim mb-2">Your payout setup isn't complete yet. Stripe may need a few more details.</p>
            <p className="text-brass-dim text-sm mb-8">Click below to continue where you left off.</p>
            <div className="space-y-3">
              <Link href="/seller/payout-setup" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Continue Payout Setup →</Link>
              <Link href="/seller/dashboard" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">Back to Dashboard</Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
