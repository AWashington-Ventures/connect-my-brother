"use client"
import { useState, useEffect, useRef } from 'react'
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

  // Form state
  const [bio, setBio] = useState('')
  const [skillsRaw, setSkillsRaw] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [photos, setPhotos] = useState<string[]>(['', '', '', '', '', ''])
  const [videos, setVideos] = useState<string[]>(['', '', ''])
  const [websites, setWebsites] = useState<{label: string, url: string}[]>([
    { label: '', url: '' },
    { label: '', url: '' },
    { label: '', url: '' },
    { label: '', url: '' },
    { label: '', url: '' },
  ])

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/member/me')
        .then(r => r.json())
        .then(data => {
          if (data.member) {
            const m = data.member
            setMember(m)
            setBio(m.bio || '')
            setSkillsRaw(m.skillsRaw || '')
            setProfilePicture(m.profilePicture || '')
            // Merge saved photos into array
            const savedPhotos = m.photos || []
            const p = [...savedPhotos, '', '', '', '', '', ''].slice(0, 6)
            setPhotos(p)
            const savedVideos = m.videos || []
            const v = [...savedVideos, '', '', ''].slice(0, 3)
            setVideos(v)
            const savedWebsites = m.websites || []
            const w = [...savedWebsites, 
              { label: '', url: '' }, { label: '', url: '' }, { label: '', url: '' },
              { label: '', url: '' }, { label: '', url: '' }
            ].slice(0, 5)
            setWebsites(w)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status, router])

  const updateWebsite = (idx: number, field: 'label' | 'url', val: string) => {
    const w = [...websites]
    w[idx] = { ...w[idx], [field]: val }
    setWebsites(w)
  }

  const updatePhoto = (idx: number, val: string) => {
    const p = [...photos]
    p[idx] = val
    setPhotos(p)
  }

  const updateVideo = (idx: number, val: string) => {
    const v = [...videos]
    v[idx] = val
    setVideos(v)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/member/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio, skillsRaw, profilePicture,
          photos: photos.filter(p => p.trim()),
          videos: videos.filter(v => v.trim()),
          websites: websites.filter(w => w.url.trim())
        })
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

  const inputClass = "input-cmb w-full px-3 py-2 rounded-lg text-sm"
  const labelClass = "block text-brass-dim text-xs font-semibold mb-1 font-serif"
  const sectionClass = "card-cmb rounded-2xl p-6 mb-4"

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-brass-dim hover:text-brass text-sm">&larr; Back</button>
          <h1 className="font-serif font-bold text-brass text-xl">Edit My Profile</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Profile Photo */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-4">📸 Profile Photo</h2>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-20 h-20 rounded-full border-2 border-brass-cmb overflow-hidden flex-shrink-0">
                {profilePicture
                  ? <img src={profilePicture} className="w-full h-full object-cover" alt="Profile" />
                  : <div className="w-full h-full bg-purple-dark flex items-center justify-center text-3xl">👤</div>}
              </div>
              <div className="flex-1">
                <label className={labelClass}>Profile Photo URL</label>
                <input type="url" value={profilePicture} onChange={e => setProfilePicture(e.target.value)}
                  className={inputClass} placeholder="https://your-photo-link.jpg" />
                <p className="text-brass-dim/60 text-xs mt-1">Paste a direct link to your photo. Direct phone upload coming soon.</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-4">📝 Bio</h2>
            <label className={labelClass}>About Me</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              className={`${inputClass} h-28 resize-none`}
              placeholder="Tell your brothers about yourself, your work, your mission..."
            />
          </div>

          {/* Skills */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-4">🔑 Skills & Abilities</h2>
            <label className={labelClass}>Keywords (separate with commas, semicolons, or colons)</label>
            <textarea value={skillsRaw} onChange={e => setSkillsRaw(e.target.value)}
              className={`${inputClass} h-24 resize-none`}
              placeholder="e.g. real estate, law, security consulting, mentorship, fitness"
            />
          </div>

          {/* Websites */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-4">🌐 Websites & Links (up to 5)</h2>
            <div className="space-y-3">
              {websites.map((w, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="w-32">
                    {i === 0 && <label className={labelClass}>Label</label>}
                    <input type="text" value={w.label} onChange={e => updateWebsite(i, 'label', e.target.value)}
                      className={inputClass} placeholder="e.g. GuardianPath DC" />
                  </div>
                  <div className="flex-1">
                    {i === 0 && <label className={labelClass}>URL</label>}
                    <input type="url" value={w.url} onChange={e => updateWebsite(i, 'url', e.target.value)}
                      className={inputClass} placeholder="https://yoursite.com" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Gallery */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-2">🖼️ Photo Gallery (up to 6)</h2>
            <p className="text-brass-dim/70 text-xs mb-4">Paste direct image URLs. Direct phone upload coming soon.</p>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((p, i) => (
                <div key={i}>
                  {p && (
                    <div className="w-full h-20 rounded-lg overflow-hidden mb-1">
                      <img src={p} className="w-full h-full object-cover" alt="" onError={e => (e.currentTarget.style.display='none')} />
                    </div>
                  )}
                  <input type="url" value={p} onChange={e => updatePhoto(i, e.target.value)}
                    className={`${inputClass} text-xs`} placeholder={`Photo ${i+1} URL`} />
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-2">🎥 Videos (up to 3)</h2>
            <p className="text-brass-dim/70 text-xs mb-4">Paste YouTube or Vimeo links.</p>
            <div className="space-y-3">
              {videos.map((v, i) => (
                <div key={i}>
                  <label className={labelClass}>Video {i+1} URL</label>
                  <input type="url" value={v} onChange={e => updateVideo(i, e.target.value)}
                    className={inputClass} placeholder="https://youtube.com/watch?v=..."/>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-500/40 rounded-lg p-3 text-green-300 text-sm">✅ Profile saved! Redirecting...</div>
          )}

          <button type="submit" disabled={saving}
            className="btn-brass w-full py-4 rounded-xl text-sm font-semibold font-serif">
            {saving ? 'Saving Profile...' : '🛡️ Save Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}
