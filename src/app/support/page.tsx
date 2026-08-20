'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TICKET_TYPES = ['Question', 'Bug Report', 'Feature Request', 'Account Issue', 'Payment Issue', 'Other']

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [type, setType] = useState('Question')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true); setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, subject, message })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSuccess(true)
      setSubject(''); setMessage('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const inputClass = 'w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-xl px-4 py-3 text-brass placeholder:text-brass-dim/40 focus:outline-none focus:border-brass-cmb/60 text-sm'
  const labelClass = 'block text-brass-dim text-xs font-semibold uppercase tracking-wider mb-1'

  return (
    <div className="min-h-screen bg-purple-cmb text-brass-dim px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-12 h-auto rounded-xl" />
            <h1 className="font-serif font-bold text-brass text-3xl">Help & Support</h1>
          </div>
          <p className="text-brass-dim/70 text-sm">Have a question or issue? We're here to help, Brother.</p>
        </div>

        {success ? (
          <div className="card-cmb rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="font-serif font-bold text-brass text-xl mb-2">Message Sent!</h2>
            <p className="text-brass-dim/70 text-sm mb-6">Your message has been received. We'll get back to you as soon as possible.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setSuccess(false)} className="btn-brass px-4 py-2 rounded-xl text-sm">Send Another</button>
              <Link href="/dashboard" className="px-4 py-2 rounded-xl border border-brass-cmb/40 text-brass-dim hover:text-brass text-sm transition-all">Dashboard</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-cmb rounded-2xl p-6 space-y-5">
            {/* Sender info (read-only) */}
            <div className="bg-purple-dark/40 rounded-xl p-3 text-sm">
              <p className="text-brass-dim/50 text-xs mb-1">Submitting as:</p>
              <p className="text-brass font-semibold">{session?.user?.name}</p>
              <p className="text-brass-dim/60 text-xs">{session?.user?.email}</p>
            </div>

            {/* Type */}
            <div>
              <label className={labelClass}>Request Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TICKET_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                      type === t
                        ? 'border-brass-cmb bg-brass-cmb/20 text-brass'
                        : 'border-brass-cmb/20 text-brass-dim/60 hover:border-brass-cmb/50'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className={labelClass}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                className={inputClass} placeholder="Brief description of your issue" required />
            </div>

            {/* Message */}
            <div>
              <label className={labelClass}>Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                className={`${inputClass} h-32 resize-none`}
                placeholder="Describe your question or issue in detail..." required />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={sending}
              className="w-full py-3 bg-brass-cmb text-purple-cmb font-bold rounded-xl hover:bg-brass-cmb/90 transition-all disabled:opacity-50 font-serif">
              {sending ? 'Sending...' : '🏛️ Send Message'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-brass-dim/50 hover:text-brass text-sm transition-colors">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
