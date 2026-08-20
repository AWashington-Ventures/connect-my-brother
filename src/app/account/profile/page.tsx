'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [member, setMember] = useState<any>(null)
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [skillsRaw, setSkillsRaw] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/member/me')
        .then(r => r.json())
        .then(data => {
          if (data.member) {
            setMember(data.member)
            setBio(data.member.bio || '')
            setWebsite(data.member.website || '')
            setSkillsRaw(data.member.skillsRaw || '')
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/member/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, website, skillsRaw })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return <main className="min-h-screen flex items-center justify-center"><div className="text-brass font-serif text-xl">Loading...</div></main>
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-brass-dim hover:text-brass text-sm">&larr; Back to Dashboard</button>
        </div>

        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/cmb-logo.jpg" alt="CMB" className="w-16 h-auto rounded-xl" />
            </div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-1">Edit Your Profile</h1>
            {member && (
              <p className="text-brass-dim text-sm">{member.fullName} · {member.lodgeName} No. {member.lodgeNumber}</p>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Bio / About Me</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm h-24 resize-none"
                placeholder="Tell your brothers about yourself, your work, your mission..."
              />
            </div>

            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Website / Business Link</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Skills &amp; Abilities</label>
              <textarea
                value={skillsRaw}
                onChange={e => setSkillsRaw(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm h-28 resize-none"
                placeholder="e.g. plumbing, electrical, real estate, law, cybersecurity, construction, accounting"
              />
              <p className="text-brass-dim text-xs mt-1">Separate with commas, semicolons, or colons. These become searchable keywords.</p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-500/40 rounded-lg p-3 text-green-300 text-sm">✅ Profile saved! Redirecting to dashboard...</div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-brass w-full py-3 rounded-lg text-sm font-semibold"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
