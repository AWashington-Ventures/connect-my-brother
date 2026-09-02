'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const SUBJECTS = [
  'I cannot log in',
  'I need to reset my password',
  'Problem with my dues card verification',
  'Marketplace question',
  'Events Poster question',
  'Billing or subscription question',
  'I want to delete my account',
  'Other',
]

export default function HelpPage() {
  const { data: session } = useSession()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) {
      setError('Please fill out all required fields.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (session?.user?.email) {
        // Logged in — use authenticated support route
        const res = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, message, type: 'Help Request' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send message')
      } else {
        // Not logged in — use public support route
        const res = await fetch('/api/support/public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send message')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Get Help</h1>
          <p className="text-brass-dim">Send us a message and we will respond as soon as possible.</p>
        </div>

        {success ? (
          <div className="card-cmb rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-serif font-bold text-brass text-2xl mb-3">Message Sent!</h2>
            <p className="text-gray-300 text-sm mb-6">Thank you for reaching out. Our team will respond to your inquiry promptly — typically within 24 hours.</p>
            <Link href="/" className="btn-brass px-6 py-3 rounded-lg font-serif font-bold">Back to Home</Link>
          </div>
        ) : (
          <div className="card-cmb rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {!session?.user?.email && (
                <>
                  <div>
                    <label className="block text-brass font-serif font-semibold text-sm mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Brother John Smith"
                      className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass placeholder-brass-dim/40 focus:outline-none focus:border-brass-cmb"
                    />
                  </div>
                  <div>
                    <label className="block text-brass font-serif font-semibold text-sm mb-2">Your Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass placeholder-brass-dim/40 focus:outline-none focus:border-brass-cmb"
                    />
                  </div>
                </>
              )}

              {session?.user?.email && (
                <div className="bg-brass-cmb/10 border border-brass-cmb/20 rounded-lg p-3">
                  <p className="text-brass-dim text-sm">Sending as: <span className="text-brass font-semibold">{session.user.name || session.user.email}</span></p>
                </div>
              )}

              <div>
                <label className="block text-brass font-serif font-semibold text-sm mb-2">What do you need help with? *</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass focus:outline-none focus:border-brass-cmb"
                >
                  <option value="" disabled>Select a topic...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-brass font-serif font-semibold text-sm mb-2">Describe your issue *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Please describe your issue or question in detail..."
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass placeholder-brass-dim/40 focus:outline-none focus:border-brass-cmb resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brass py-4 rounded-lg font-serif font-bold text-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-brass-cmb/20 text-center">
              <p className="text-brass-dim text-xs">Looking for answers? Check our <Link href="/faq" className="text-brass underline">FAQ page</Link> — you may find your answer there instantly.</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
