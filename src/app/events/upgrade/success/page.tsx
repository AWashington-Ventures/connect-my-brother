'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function EventsUpgradeSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found. If you completed payment, please contact support.')
      return
    }
    fetch('/api/events/upgrade-success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStatus('success')
        else { setStatus('error'); setMessage(data.error || 'Upgrade confirmation failed.') }
      })
      .catch(() => { setStatus('error'); setMessage('Connection error. Please contact support.') })
  }, [searchParams])

  return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      {status === 'loading' && (
        <><div className="text-5xl mb-4">⏳</div>
        <h1 className="font-serif font-bold text-brass text-2xl mb-2">Activating Your Account...</h1>
        <p className="text-brass-dim">Please wait while we set up your Events Poster account.</p></>
      )}
      {status === 'success' && (
        <><div className="text-6xl mb-6">🎉</div>
        <h1 className="font-serif font-bold text-brass text-3xl mb-3">You're an Events Poster!</h1>
        <p className="text-brass-dim mb-2">Your account is now active. Start sharing events with the entire Masonic network.</p>
        <div className="space-y-3 mt-8">
          <Link href="/events/post" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg">Post Your First Event →</Link>
          <Link href="/events" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">Browse Events</Link>
        </div></>
      )}
      {status === 'error' && (
        <><div className="text-5xl mb-4">⚠️</div>
        <h1 className="font-serif font-bold text-brass text-2xl mb-3">Something Went Wrong</h1>
        <p className="text-brass-dim text-sm mb-6">{message}</p>
        <Link href="/support" className="inline-block btn-brass px-6 py-3 rounded-xl font-serif">Contact Support</Link></>
      )}
    </div>
  )
}

export default function EventsUpgradeSuccessPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-brass font-serif text-xl">Loading...</p>
        </div>
      }>
        <EventsUpgradeSuccessContent />
      </Suspense>
    </main>
  )
}
