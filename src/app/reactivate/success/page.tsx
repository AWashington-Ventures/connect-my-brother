'use client'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function ReactivateSuccessPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/reactivate')
      return
    }

    fetch('/api/reactivate/success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
        } else {
          setError(data.error || 'Something went wrong')
          setStatus('error')
        }
      })
      .catch(() => {
        setError('Network error — please contact support')
        setStatus('error')
      })
  }, [searchParams, router])

  const handleSignInAgain = async () => {
    // Sign out to clear the stale JWT, then redirect to login
    // The fresh login will generate a new JWT with hasActiveSubscription: true
    await signOut({ callbackUrl: '/login?reactivated=1' })
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto">
        <div className="card-cmb rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/cmb-logo.jpg" alt="Connect My Brother" className="w-20 h-auto rounded-xl" />
          </div>

          {status === 'loading' && (
            <>
              <div className="text-brass font-serif text-xl mb-4">Verifying your payment...</div>
              <p className="text-brass-dim text-sm">Just a moment, Brother.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="font-serif font-bold text-brass text-2xl mb-3">
                Welcome Back, Brother!
              </h1>
              {session?.user?.name && (
                <p className="text-brass-dim text-sm mb-4">
                  {session.user.name.split(' ')[0]}, your membership has been reactivated.
                </p>
              )}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Your profile, connections, and all your data are restored. Sign in again to access the full network.
              </p>
              <div className="card-cmb rounded-xl p-4 mb-6 text-left border border-green-500/30">
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>✅ Full directory access restored</li>
                  <li>✅ Events board access restored</li>
                  <li>✅ Marketplace access restored</li>
                  <li>✅ All your profile data preserved</li>
                </ul>
              </div>
              <button
                onClick={handleSignInAgain}
                className="btn-brass w-full py-4 rounded-lg text-lg font-bold font-serif"
              >
                Sign In to My Account →
              </button>
              <p className="text-brass-dim/60 text-xs mt-3">
                You&apos;ll be taken to the login page to complete access.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="font-serif font-bold text-brass text-xl mb-3">Something Went Wrong</h1>
              <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>
              <p className="text-gray-300 text-sm mb-6">
                Your payment may have gone through. Please contact support at{' '}
                <a href="mailto:support@connectmybrother.com" className="text-brass underline">
                  support@connectmybrother.com
                </a>
              </p>
              <a href="/reactivate" className="btn-brass inline-block px-6 py-3 rounded-lg font-bold font-serif">
                Try Again
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
