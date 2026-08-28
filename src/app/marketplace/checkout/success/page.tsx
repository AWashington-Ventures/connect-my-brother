'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()
  const sessionId = searchParams.get('session_id') || ''

  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [order, setOrder] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && sessionId) {
      fetch('/api/checkout/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setOrder(data.order)
            setState('success')
          } else {
            setErrorMsg(data.error || 'Something went wrong processing your order.')
            setState('error')
          }
        })
        .catch(() => {
          setErrorMsg('Unable to confirm your order. Please contact support.')
          setState('error')
        })
    } else if (status === 'authenticated' && !sessionId) {
      setErrorMsg('Missing payment session. Please contact support.')
      setState('error')
    }
  }, [status, sessionId, router])

  if (state === 'loading') {
    return (
      <div className="max-w-lg mx-auto mt-24 text-center">
        <div className="text-5xl mb-4 animate-pulse">⏳</div>
        <h1 className="font-serif font-bold text-brass text-2xl mb-2">Confirming your order...</h1>
        <p className="text-brass-dim text-sm">Please wait while we process your payment.</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="max-w-lg mx-auto mt-24 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="font-serif font-bold text-brass text-2xl mb-3">Something went wrong</h1>
        <p className="text-brass-dim mb-6">{errorMsg}</p>
        <p className="text-brass-dim text-sm mb-8">If you were charged, your payment will be refunded automatically. Please contact support if you need help.</p>
        <div className="space-y-3">
          <Link href="/marketplace" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Back to Marketplace</Link>
          <Link href="/support" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">Contact Support</Link>
        </div>
      </div>
    )
  }

  // Success state
  const amountDisplay = order?.amount ? `$${(order.amount / 100).toFixed(2)}` : ''

  return (
    <div className="max-w-lg mx-auto mt-10">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="font-serif font-bold text-brass text-3xl mb-2">Order Confirmed!</h1>
        <p className="text-brass-dim">A confirmation has been sent to your email.</p>
      </div>

      {/* Order summary card */}
      <div className="card-cmb rounded-2xl p-6 mb-4">
        <h2 className="font-serif font-bold text-brass text-lg mb-4">Order Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <span className="text-brass-dim text-sm">Item</span>
            <span className="text-brass text-sm font-semibold text-right">{order?.listingTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brass-dim text-sm">Amount paid</span>
            <span className="text-brass font-bold text-lg">{amountDisplay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brass-dim text-sm">Seller</span>
            <span className="text-brass text-sm">{order?.sellerName}</span>
          </div>
          {order?._id && (
            <div className="flex justify-between items-center pt-2 border-t border-brass-cmb/20">
              <span className="text-brass-dim text-xs">Order ID</span>
              <code className="text-brass text-xs">{order._id}</code>
            </div>
          )}
        </div>
      </div>

      {/* Shipping instructions */}
      <div className="rounded-xl bg-brass-cmb/10 border border-brass-cmb/20 p-4 mb-4">
        <h3 className="font-serif font-bold text-brass text-sm mb-2">📦 Next Steps</h3>
        <p className="text-brass-dim text-sm leading-relaxed">
          Contact <strong className="text-brass">{order?.sellerName}</strong> directly to arrange shipping.
          The seller will ship your item once you connect.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4 mb-6">
        <p className="text-brass-dim text-xs leading-relaxed">
          <strong className="text-brass">Disclaimer:</strong> A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold through this platform. All transactions are solely between the buyer and the seller.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/marketplace" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold text-center">Browse More Listings →</Link>
        <Link href="/dashboard" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all text-center">Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-lg mx-auto mt-24 text-center">
          <p className="text-brass font-serif text-xl">Loading...</p>
        </div>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </main>
  )
}
