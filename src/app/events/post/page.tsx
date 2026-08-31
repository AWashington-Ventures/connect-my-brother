'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'weywf5mi'
const UPLOAD_PRESET = 'cmb_uploads'

async function uploadFlyerToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'event_flyers')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message || 'Flyer upload failed')
  return data.secure_url
}

// Auto-convert Cloudinary HEIC/HEIF to browser-friendly format
function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

export default function PostEventPage() {
  const { status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Flyer upload state
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string>('')
  const [uploadingFlyer, setUploadingFlyer] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    flyer: '',
    tags: '',
    category: 'General',
    recurrence: 'none',
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

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFlyerFile(file)
    // Use FileReader for reliable cross-browser/mobile preview (same as marketplace)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setFlyerPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFlyer = () => {
    setFlyerFile(null)
    setFlyerPreview('')
    setForm(f => ({ ...f, flyer: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let flyerUrl = form.flyer

      // Upload flyer to Cloudinary if a file was selected
      if (flyerFile) {
        setUploadingFlyer(true)
        try {
          flyerUrl = await uploadFlyerToCloudinary(flyerFile)
        } finally {
          setUploadingFlyer(false)
        }
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Convert datetime-local strings to UTC ISO strings to prevent timezone shifting
          date: form.date ? new Date(form.date).toISOString() : undefined,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
          flyer: flyerUrl,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.event) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to post event.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
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
            <button
              onClick={() => {
                setSuccess(false)
                setFlyerFile(null)
                setFlyerPreview('')
                setForm({ title: '', description: '', date: '', endDate: '', location: '', flyer: '', tags: '', category: 'General', recurrence: 'none' })
              }}
              className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all"
            >
              Post Another Event
            </button>
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
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="Grand Lodge Annual Banquet"
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              />
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
                rows={3}
                placeholder="Event details, dress code, RSVP info..."
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">Date *</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
                />
              </div>
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
                />
              </div>
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Repeats</label>
              <select
                value={form.recurrence}
                onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              >
                <option value="none">Does not repeat</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {form.recurrence !== 'none' && (
                <p className="text-brass-dim/70 text-xs mt-1">🔄 Recurring events stay on the board and auto-advance after each occurrence.</p>
              )}
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Location *</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
                placeholder="Washington, DC"
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              />
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              >
                {['General', 'Lodge Event', 'Social', 'Wedding', 'Party', 'Fundraiser', 'Educational', 'Memorial', 'Installation', 'OES Event'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Flyer Upload — mirrors marketplace image upload pattern */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Event Flyer / Photo</label>
              <p className="text-brass-dim/70 text-xs mb-2">Upload your event flyer or photo (JPG, PNG, PDF preview — max 10MB).</p>

              {/* Preview */}
              {flyerPreview && (
                <div className="relative mb-3">
                  <img
                    src={flyerPreview}
                    alt="Flyer preview"
                    className="w-full max-h-64 object-contain rounded-xl border border-brass-cmb/30 bg-black/20"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFlyer}
                    className="absolute top-2 right-2 bg-red-900/80 text-red-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* File picker */}
              {!flyerFile && (
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-brass-cmb/30 hover:border-brass-cmb/60 rounded-xl px-4 py-6 transition-all">
                  <span className="text-3xl">🖼️</span>
                  <div className="flex-1">
                    <p className="text-brass text-sm font-semibold">Click to upload flyer or photo</p>
                    <p className="text-brass-dim text-xs">JPG, PNG, HEIC — max 10MB. Camera supported on mobile.</p>
                  </div>
                  {/* accept="image/*" allows camera capture on mobile */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFlyerChange}
                    className="hidden"
                  />
                </label>
              )}

              {flyerFile && !flyerPreview && (
                <p className="text-brass-dim text-xs">Loading preview...</p>
              )}
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Tags</label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="lodge, fundraiser, annual (comma-separated)"
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              />
            </div>

          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || uploadingFlyer}
            className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60"
          >
            {uploadingFlyer ? '⬆️ Uploading flyer...' :
             loading ? 'Posting...' :
             'Post Event →'}
          </button>
        </form>
      </div>
    </main>
  )
}
