'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ReactivatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleReactivate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reactivate/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

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
      <div className="max-w-lg mx-auto">
        <div className="card-cmb rounded-2xl p-8 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <img src="/cmb-logo.jpg" alt="Connect My Brother" className="w-20 h-auto rounded-xl" />
          </div>

          {/* Heading */}
          <div className="inline-block bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-bold px-4 py-1 rounded-full mb-4">
            🔒 FOUNDING MEMBER ACCESS EXPIRED
          </div>

          <h1 className="font-serif font-bold text-brass text-2xl mb-3">
            Reactivate Your Membership
          </h1>

          {session?.user?.name && (
            <p className="text-brass-dim text-sm mb-2">
              Welcome back, Brother {session.user.name.split(' ')[0]}.
            </p>
          )}

          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Your free founding member access ended on <strong className="text-brass">January 1, 2027</strong>.
            Your profile, photos, skills, and connections are all <strong className="text-green-400">safely preserved</strong> — subscribe to restore full access.
          </p>

          {/* What they get back */}
          <div className="card-cmb rounded-xl p-4 mb-6 text-left border border-brass-cmb/30">
            <p className="text-brass font-serif font-semibold text-sm mb-3">🔓 Restore full access to:</p>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>✅ Your profile &amp; all your connections</li>
              <li>✅ Verified brother directory</li>
              <li>✅ Events board</li>
              <li>✅ Marketplace (view &amp; purchase)</li>
              <li>✅ Marketplace Seller &amp; Events Poster add-ons</li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <p className="text-brass font-serif font-bold text-3xl mb-1">
              $5<span className="text-lg">/month</span>
            </p>
            <p className="text-brass-dim text-xs">50% supports Ionic Lodge No. 17</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>
          )}

          <button
            onClick={handleReactivate}
            disabled={loading}
            className="btn-brass w-full py-4 rounded-lg text-lg font-bold font-serif disabled:opacity-50 mb-3"
          >
            {loading ? 'Redirecting to payment...' : 'Reactivate Membership — $5/month →'}
          </button>

          <p className="text-brass-dim/60 text-xs">
            Cancel anytime. Your data is always yours.
          </p>
        </div>
      </div>
    </main>
  )
}
