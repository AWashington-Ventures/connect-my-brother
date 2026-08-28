'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PostEventPage() {
  const { status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    flyer: '',
    tags: '',
    category: 'General',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/member/me').then(r => r.json()).then(d => { if (d.member) setMember(d.member) })
    }
  }, [status, router])

  if (member && member.eventsTier !== 'poster') {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4">
        <Navbar />
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="font-serif font-bold text-brass text-2xl mb-3">Events Poster Account Required</h1>
          <p className="text-brass-dim mb-6">Upgrade for $1/month to post events to the CMB & CMS network.</p>
          <Link href="/events/upgrade" className="btn-brass px-6 py-3 rounded-xl font-serif font-bold">Upgrade Now →</Link>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.event) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to post event.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4">
        <Navbar />
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Event Posted!</h1>
          <p className="text-brass-dim mb-8">Your event is now live on the CMB Events Board.</p>
          <div className="space-y-3">
            <Link href="/events" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">View Events Board</Link>
            <button onClick={() => { setSuccess(false); setForm({ title: '', description: '', date: '', endDate: '', location: '', flyer: '', tags: '', category: 'General' }) }} className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all w-full">Post Another Event</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto mt-6">
        <div className="mb-6">
          <h1 className="font-serif font-bold text-brass text-2xl mb-1">📅 Post an Event</h1>
          <p className="text-brass-dim text-sm">Share with the entire CMB & CMS network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card-cmb rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Event Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Grand Lodge Annual Banquet" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder="Event details, dress code, RSVP info..." className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">Date *</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
              </div>
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">End Date</label>
                <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
              </div>
            </div>
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Location *</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required placeholder="Washington, DC" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb">
                {['General', 'Lodge Event', 'Social', 'Wedding', 'Party', 'Fundraiser', 'Educational', 'Memorial', 'Installation', 'OES Event'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Flyer Image URL</label>
              <input value={form.flyer} onChange={e => setForm(f => ({ ...f, flyer: e.target.value }))} placeholder="https://... (Cloudinary or image link)" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="lodge, fundraiser, annual (comma-separated)" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>
          </div>

          {error && <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60">
            {loading ? 'Posting...' : 'Post Event →'}
          </button>
        </form>
      </div>
    </main>
  )
}
