'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return match ? match[1] : null
}

function getFavicon(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

export default function BrotherProfilePage() {
  const params = useParams()
  const [brother, setBrother] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [message, setMessage] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

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

  const lodgeDisplay = brother
    ? `${brother.lodgeName}${brother.lodgeNumber ? ' #' + brother.lodgeNumber : ''}`
    : ''

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

  const photos = (brother.photos || []).filter(Boolean)
  const videos = (brother.videos || []).filter(Boolean)
  const websites = (brother.websites || []).filter((w: any) => w.url)

  return (
    <main className="min-h-screen pt-16 pb-16">
      <Navbar />
      {/* Hero Header */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-purple-dark via-purple-cmb to-purple-dark">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(/masonic-watermark.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 pb-4">
            <div className="w-28 h-28 rounded-2xl border-4 border-brass-cmb overflow-hidden flex-shrink-0 shadow-xl">
              {brother.profilePicture
                ? <img src={brother.profilePicture} className="w-full h-full object-cover" alt={brother.fullName} />
                : <div className="w-full h-full bg-purple-dark flex items-center justify-center text-5xl">👤</div>}
            </div>
            <div className="pb-2">
              <h1 className="font-serif font-bold text-brass text-2xl">{brother.fullName}</h1>
              <p className="text-brass-dim text-sm">{lodgeDisplay}, F. & A.M.</p>
              <p className="text-gray-400 text-xs">{brother.cityState}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-4">

        {/* Bio */}
        {brother.bio && (
          <div className="card-cmb rounded-2xl p-6">
            <h2 className="font-serif font-bold text-brass text-sm mb-3">About Brother {brother.fullName.split(' ')[0]}</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{brother.bio}</p>
          </div>
        )}

        {/* Websites */}
        {websites.length > 0 && (
          <div className="card-cmb rounded-2xl p-6">
            <h2 className="font-serif font-bold text-brass text-sm mb-4">🌐 Websites & Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {websites.map((w: any, i: number) => (
                <a key={i} href={w.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-cmb/30 border border-brass-cmb/20 rounded-xl p-3 hover:border-brass-cmb/60 transition-all group">
                  <img src={getFavicon(w.url)} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
                  <div className="overflow-hidden">
                    <p className="text-brass text-sm font-semibold font-serif truncate group-hover:underline">{w.label || new URL(w.url).hostname}</p>
                    <p className="text-brass-dim/60 text-xs truncate">{w.url}</p>
                  </div>
                  <span className="text-brass-dim ml-auto">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="card-cmb rounded-2xl p-6">
            <h2 className="font-serif font-bold text-brass text-sm mb-4">📸 Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p: string, i: number) => (
                <button key={i} onClick={() => setActivePhoto(p)}
                  className="aspect-square rounded-xl overflow-hidden border border-brass-cmb/20 hover:border-brass-cmb/60 transition-all">
                  <img src={p} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="card-cmb rounded-2xl p-6">
            <h2 className="font-serif font-bold text-brass text-sm mb-4">🎥 Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((v: string, i: number) => {
                const ytId = getYouTubeId(v)
                return ytId ? (
                  <div key={i} className="rounded-xl overflow-hidden border border-brass-cmb/20 aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={`Video ${i+1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a key={i} href={v} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-purple-cmb/30 border border-brass-cmb/20 rounded-xl p-3 hover:border-brass-cmb/60 transition-all">
                    <span className="text-2xl">▶️</span>
                    <span className="text-brass text-sm truncate">{v}</span>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Skills */}
        {brother.skills?.length > 0 && (
          <div className="card-cmb rounded-2xl p-6">
            <h2 className="font-serif font-bold text-brass text-sm mb-3">Skills & Services</h2>
            <div className="flex flex-wrap gap-2">
              {brother.skills.map((s: string) => (
                <span key={s} className="text-sm bg-brass-cmb/20 text-brass px-3 py-1 rounded-full border border-brass-cmb/40 capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Connect Now */}
        <div className="card-cmb rounded-2xl p-6">
          {sent ? (
            <div className="text-center p-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-brass font-serif font-bold">Connection Request Sent!</p>
              <p className="text-brass-dim text-sm mt-1">Brother {brother.fullName.split(' ')[0]} will receive your message and can reply directly to you.</p>
            </div>
          ) : !showConnect ? (
            <div className="text-center">
              <button onClick={() => setShowConnect(true)} className="btn-brass px-10 py-4 rounded-xl font-serif font-bold text-lg">🤝 Connect Now</button>
              <p className="text-brass-dim/60 text-xs mt-2">Send a private message to Brother {brother.fullName.split(' ')[0]}</p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <h3 className="font-serif font-bold text-brass text-center mb-4">Send a Connection Request</h3>
              <div>
                <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Your Email Address *</label>
                <input className="input-cmb w-full px-3 py-2 rounded-lg text-sm" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Personal Message</label>
                <textarea className="input-cmb w-full px-3 py-2 rounded-lg text-sm resize-none" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={`Greetings Brother ${brother.fullName.split(' ')[0]}...`} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={sending} className="btn-brass flex-1 py-3 rounded-lg font-serif font-bold">{sending ? 'Sending...' : 'Send Connection Request'}</button>
                <button type="button" onClick={() => setShowConnect(false)} className="px-4 py-3 rounded-lg font-serif text-brass-dim border border-brass-cmb/30 hover:text-brass">Cancel</button>
              </div>
              <p className="text-brass-dim/60 text-xs text-center">Your email will only be shared if Brother {brother.fullName.split(' ')[0]} replies.</p>
            </form>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActivePhoto(null)}>
          <img src={activePhoto} alt="" className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setActivePhoto(null)} className="absolute top-4 right-4 text-white text-2xl">✕</button>
        </div>
      )}

      <Footer />
    </main>
  )
}
