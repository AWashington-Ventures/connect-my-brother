'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const [dues, setDues] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({
    bio: '', website: '', skillsRaw: '', profilePicture: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const d = sessionStorage.getItem('cmb_dues')
    const e = sessionStorage.getItem('cmb_email')
    if (!d || !e) { router.push('/register/dues-card'); return }
    setDues(JSON.parse(d))
    setEmail(e)
  }, [router])

  const update = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      setForm(f => ({...f, profilePicture: result}))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dues, email, ...form })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Profile save failed')
      sessionStorage.clear()
      router.push('/register/set-password')
    } catch(err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'input-cmb w-full px-3 py-2 rounded-lg text-sm'
  const labelClass = 'block text-brass-dim text-xs font-semibold mb-1 font-serif'

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-2 mb-8">
          {['1. Verify Dues Card', '2. Subscribe', '3. Create Profile'].map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded text-xs font-serif ${
              i === 2 ? 'bg-brass-cmb text-purple-dark font-bold' : 'text-brass border border-brass-cmb/50'
            }`}>{s}</div>
          ))}
        </div>

        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">👤</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Create Your Profile</h1>
            {dues && <p className="text-brass-dim text-sm">Brother {dues.fullName} — {dues.lodgeName} Lodge {dues.lodgeNumber}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-brass-cmb overflow-hidden bg-purple-dark flex items-center justify-center">
                {preview
                  ? <img src={preview} className="w-full h-full object-cover" alt="Profile" />
                  : <span className="text-3xl">👤</span>}
              </div>
              <label className="btn-outline-brass px-4 py-2 rounded text-xs cursor-pointer font-serif">
                Upload Profile Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {/* Auto-populated info (read-only display) */}
            {dues && (
              <div className="bg-purple-dark/40 rounded-xl p-4 border border-brass-cmb/20">
                <p className="text-brass text-xs font-bold font-serif mb-3">AUTO-POPULATED FROM DUES CARD:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-brass-dim">Name:</span> <span className="text-gray-200">{dues.fullName}</span></div>
                  <div><span className="text-brass-dim">Lodge:</span> <span className="text-gray-200">{dues.lodgeName} #{dues.lodgeNumber}</span></div>
                  <div><span className="text-brass-dim">Grand Lodge:</span> <span className="text-gray-200">{dues.grandLodge}</span></div>
                  <div><span className="text-brass-dim">Location:</span> <span className="text-gray-200">{dues.cityState}</span></div>
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>About You / Bio</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={4}
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder="Tell the brotherhood about yourself — your background, business, and how you can serve your brothers..."
              />
            </div>

            <div>
              <label className={labelClass}>Website / Business Link</label>
              <input className={inputClass} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yourbusiness.com" />
            </div>

            <div>
              <label className={labelClass}>Skills & Abilities * <span className="text-brass-dim/60 font-normal">(these become searchable keywords)</span></label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={4}
                value={form.skillsRaw}
                onChange={e => update('skillsRaw', e.target.value)}
                placeholder="Enter your skills separated by commas, semicolons, or colons&#10;Example: Real Estate, Plumbing; Electrical; IT Support, Web Design: Legal Advice, Financial Planning"
                required
              />
              <p className="text-brass-dim/60 text-xs mt-1">Separate skills with commas (,) semicolons (;) or colons (:). Each entry becomes a searchable keyword.</p>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-brass w-full py-4 rounded-lg text-lg font-bold font-serif disabled:opacity-50">
              {loading ? 'Saving your profile...' : 'Complete My Profile & Enter →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
