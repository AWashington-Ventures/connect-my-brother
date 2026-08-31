'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { uploadToCloudinary } from '@/lib/cloudinary'

function UploadButton({ onUploaded, children, className, accept = 'image/*', resourceType = 'image' as 'image' | 'video' }: { 
  onUploaded: (url: string) => void, 
  children: React.ReactNode, 
  className?: string,
  accept?: string,
  resourceType?: 'image' | 'video'
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, resourceType)
      onUploaded(url)
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className={className || 'btn-brass px-3 py-1.5 rounded-lg text-xs font-semibold'}>
        {uploading ? '⏳ Uploading...' : children}
      </button>
    </>
  )
}

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [member, setMember] = useState<any>(null)

  const [bio, setBio] = useState('')
  const [skillsRaw, setSkillsRaw] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [photos, setPhotos] = useState<string[]>(Array(6).fill(''))
  const [videos, setVideos] = useState<string[]>(Array(3).fill(''))
  const [websites, setWebsites] = useState<{label: string, url: string, icon?: string}[]>(Array(5).fill(null).map(() => ({ label: '', url: '', icon: '' })))
  const [alertPrefs, setAlertPrefs] = useState({ newEvent: true, newMarketplaceListing: true, newJobListing: true })
  const [alertSaving, setAlertSaving] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/member/me').then(r => r.json()).then(data => {
        if (data.member) {
          const m = data.member
          setMember(m)
          setBio(m.bio || '')
          setSkillsRaw(m.skillsRaw || '')
          setProfilePicture(m.profilePicture || '')
          const savedPhotos = m.photos || []
          setPhotos([...savedPhotos, ...Array(6).fill('')].slice(0, 6))
          const savedVideos = m.videos || []
          setVideos([...savedVideos, ...Array(3).fill('')].slice(0, 3))
          const savedWebsites = m.websites || []
          setWebsites([...savedWebsites, ...Array(5).fill(null).map(() => ({ label: '', url: '' }))].slice(0, 5))
        }
        setLoading(false)
      }).catch(() => setLoading(false))
      // Load alert preferences separately
      fetch('/api/member/alert-preferences').then(r => r.json()).then(data => {
        if (data.alertPreferences) setAlertPrefs(data.alertPreferences)
      }).catch(() => {})
    }
  }, [status, router])

  const updateWebsite = (idx: number, field: 'label' | 'url' | 'icon', val: string) => {
    const w = [...websites]; w[idx] = { ...w[idx], [field]: val }; setWebsites(w)
  }

  const toggleAlert = async (key: keyof typeof alertPrefs) => {
    const newVal = !alertPrefs[key]
    setAlertPrefs(prev => ({ ...prev, [key]: newVal }))
    setAlertSaving(key)
    try {
      await fetch('/api/member/alert-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal }),
      })
    } catch {}
    setTimeout(() => setAlertSaving(null), 800)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
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
    } finally { setSaving(false) }
  }

  if (loading || status === 'loading') return <main className="min-h-screen flex items-center justify-center"><div className="text-brass font-serif text-xl">Loading...</div></main>

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
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-brass-cmb overflow-hidden flex-shrink-0">
                {profilePicture ? <img src={profilePicture} className="w-full h-full object-cover" alt="Profile" />
                  : <div className="w-full h-full bg-purple-dark flex items-center justify-center text-4xl">👤</div>}
              </div>
              <div>
                <UploadButton onUploaded={setProfilePicture}>📁 Upload from Computer/Phone</UploadButton>
                <p className="text-brass-dim/60 text-xs mt-2">Opens your camera or photo gallery</p>
                {profilePicture && <p className="text-green-400 text-xs mt-1">✅ Photo uploaded</p>}
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
            <div className="space-y-4">
              {websites.map((w, i) => (
                <div key={i} className="border border-brass-cmb/20 rounded-xl p-3 bg-purple-dark/30">
                  <div className="flex gap-2 items-center mb-2">
                    {/* Icon preview + upload */}
                    <div className="flex-shrink-0">
                      {w.icon ? (
                        <img src={w.icon} alt="" className="w-10 h-10 rounded-lg object-cover border border-brass-cmb/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-brass-cmb/30 bg-purple-cmb/40 flex items-center justify-center text-brass-dim/40 text-xs">🌐</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input type="text" value={w.label} onChange={e => updateWebsite(i, 'label', e.target.value)}
                        className={inputClass} placeholder="e.g. My Business" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 min-w-0">
                      <input type="url" value={w.url} onChange={e => updateWebsite(i, 'url', e.target.value)}
                        className={inputClass} placeholder="https://yoursite.com" />
                    </div>
                    <UploadButton
                      onUploaded={(url) => updateWebsite(i, 'icon', url)}
                      className="flex-shrink-0 px-2 py-2 text-xs rounded border border-brass-cmb/40 text-brass-dim hover:text-brass hover:border-brass-cmb transition-all whitespace-nowrap"
                    >
                      📁 Upload Icon
                    </UploadButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Gallery */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-2">🖼️ Photo Gallery (up to 6)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden border border-brass-cmb/30 bg-purple-dark/50 flex items-center justify-center">
                    {p ? (
                      <img src={p} className="w-full h-full object-cover" alt={`Photo ${i+1}`} />
                    ) : (
                      <span className="text-brass-dim/40 text-xs text-center px-2">Photo {i+1}</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <UploadButton
                      onUploaded={(url) => { const p2 = [...photos]; p2[i] = url; setPhotos(p2) }}
                      className="w-full text-center py-1 text-xs rounded border border-brass-cmb/40 text-brass-dim hover:text-brass hover:border-brass-cmb transition-all"
                    >
                      {p ? '🔄 Replace' : '+ Add Photo'}
                    </UploadButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-2">🎥 Videos (up to 3)</h2>
            <div className="space-y-5">
              {videos.map((v, i) => (
                <div key={i} className="border border-brass-cmb/20 rounded-xl p-4">
                  <label className={labelClass}>Video {i+1}</label>
                  <div className="flex flex-col gap-2">
                    <UploadButton
                      onUploaded={(url) => { const v2 = [...videos]; v2[i] = url; setVideos(v2) }}
                      accept="video/*"
                      resourceType="video"
                      className="btn-brass px-3 py-2 rounded-lg text-xs font-semibold text-center"
                    >
                      📁 Upload from Computer/Phone
                    </UploadButton>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-brass-cmb/20" />
                      <span className="text-brass-dim/50 text-xs">OR</span>
                      <div className="flex-1 h-px bg-brass-cmb/20" />
                    </div>
                    <input type="url" value={v} onChange={e => { const v2 = [...videos]; v2[i] = e.target.value; setVideos(v2) }}
                      className={inputClass} placeholder="Paste YouTube / Vimeo link"/>
                    {v && <p className="text-green-400 text-xs">✅ Video added</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Preferences */}
          <div className={sectionClass}>
            <h2 className="font-serif font-bold text-brass mb-1">🔔 Alert Preferences</h2>
            <p className="text-brass-dim/60 text-xs mb-4">Choose which email alerts you'd like to receive. Changes save automatically.</p>
            <div className="space-y-3">
              {([
                { key: 'newEvent' as const, label: '📅 New Event Posted', desc: 'Get notified when a brother posts a new event' },
                { key: 'newMarketplaceListing' as const, label: '🛍 New Marketplace Listing', desc: 'Get notified when a new item is listed for sale' },
                { key: 'newJobListing' as const, label: '💼 New Job Listing', desc: 'Get notified when a new job opportunity is posted' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-brass-cmb/20 bg-purple-dark/30">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-brass text-sm font-semibold font-serif">{label}</p>
                    <p className="text-brass-dim/60 text-xs mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAlert(key)}
                    className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      alertPrefs[key] ? 'bg-brass-cmb' : 'bg-purple-dark border border-brass-cmb/30'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${
                      alertPrefs[key] ? 'translate-x-6 bg-purple-dark' : 'translate-x-0 bg-brass-dim/40'
                    }`} />
                    {alertSaving === key && <span className="absolute -top-5 right-0 text-xs text-brass-dim">✓</span>}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">{error}</div>}
          {success && <div className="bg-green-900/20 border border-green-500/40 rounded-lg p-3 text-green-300 text-sm">✅ Profile saved! Redirecting...</div>}

          <button type="submit" disabled={saving} className="btn-brass w-full py-4 rounded-xl text-sm font-semibold font-serif">
            {saving ? 'Saving Profile...' : '🛡️ Save Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}
