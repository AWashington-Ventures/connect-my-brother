'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function BrotherProfilePage() {
  const params = useParams()
  const [brother, setBrother] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [message, setMessage] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then(r => r.json())
      .then(d => { setBrother(d.member); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brotherId: params.id, senderEmail, message })
      })
      if (res.ok) { setSent(true); setShowConnect(false) }
    } catch(e) {}
    finally { setSending(false) }
  }

  if (loading) return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <Navbar />
      <div className="text-brass font-serif text-xl">Loading...</div>
    </main>
  )

  if (!brother) return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <Navbar />
      <div className="text-center"><p className="text-brass font-serif text-xl">Brother not found</p></div>
    </main>
  )

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <div className="card-cmb rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-dark to-purple-cmb p-8 text-center">
            <div className="w-28 h-28 rounded-full border-4 border-brass-cmb mx-auto mb-4 overflow-hidden">
              {brother.profilePicture
                ? <img src={brother.profilePicture} className="w-full h-full object-cover" alt={brother.fullName} />
                : <div className="w-full h-full bg-purple-dark flex items-center justify-center text-5xl">👤</div>}
            </div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-1">{brother.fullName}</h1>
            <p className="text-brass-dim">{brother.lodgeName} Lodge #{brother.lodgeNumber}, F. & A. M.</p>
            <p className="text-gray-300 text-sm mt-1">{brother.cityState}</p>
            {brother.grandLodge && <p className="text-brass-dim/60 text-xs mt-1">{brother.grandLodge}</p>}
          </div>

          <div className="p-8 space-y-6">
            {/* Bio */}
            {brother.bio && (
              <div>
                <h2 className="font-serif font-bold text-brass text-sm mb-2">About Brother {brother.fullName.split(' ')[0]}</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{brother.bio}</p>
              </div>
            )}

            {/* Website */}
            {brother.website && (
              <div>
                <h2 className="font-serif font-bold text-brass text-sm mb-2">Website</h2>
                <a href={brother.website} target="_blank" rel="noopener noreferrer" className="text-brass hover:underline text-sm">{brother.website}</a>
              </div>
            )}

            {/* Skills */}
            {brother.skills?.length > 0 && (
              <div>
                <h2 className="font-serif font-bold text-brass text-sm mb-3">Skills & Services</h2>
                <div className="flex flex-wrap gap-2">
                  {brother.skills.map((s: string) => (
                    <span key={s} className="text-sm bg-brass-cmb/20 text-brass px-3 py-1 rounded-full border border-brass-cmb/40">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="divider-brass" />

            {/* Connect Now */}
            {sent ? (
              <div className="text-center p-6 bg-brass-cmb/10 rounded-xl border border-brass-cmb/30">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-brass font-serif font-bold">Connection Request Sent!</p>
                <p className="text-brass-dim text-sm mt-1">Brother {brother.fullName.split(' ')[0]} will receive your message and can reply directly to you.</p>
              </div>
            ) : (
              <div className="text-center">
                {!showConnect ? (
                  <button onClick={() => setShowConnect(true)} className="btn-brass px-10 py-4 rounded-xl font-serif font-bold text-lg">
                    🤝 Connect Now
                  </button>
                ) : (
                  <form onSubmit={handleConnect} className="space-y-4 text-left">
                    <h3 className="font-serif font-bold text-brass text-center mb-4">Send a Connection Request</h3>
                    <div>
                      <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Your Email Address *</label>
                      <input className="input-cmb w-full px-3 py-2 rounded-lg text-sm" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="your@email.com" required />
                    </div>
                    <div>
                      <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Personal Message</label>
                      <textarea className="input-cmb w-full px-3 py-2 rounded-lg text-sm resize-none" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={`Greetings Brother ${brother.fullName.split(' ')[0]}, I came across your profile and would like to connect...`} />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={sending} className="btn-brass flex-1 py-3 rounded-lg font-serif font-bold">{sending ? 'Sending...' : 'Send Connection Request'}</button>
                      <button type="button" onClick={() => setShowConnect(false)} className="btn-outline-brass px-4 py-3 rounded-lg font-serif">Cancel</button>
                    </div>
                    <p className="text-brass-dim/60 text-xs text-center">Your email will only be shared if Brother {brother.fullName.split(' ')[0]} replies to your message.</p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
