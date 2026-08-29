'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
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

function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

// Convert a MongoDB/ISO date to datetime-local input format
function toDatetimeLocal(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return '' }
}

export default function EditEventPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFlyer, setUploadingFlyer] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Flyer state
  const [existingFlyer, setExistingFlyer] = useState<string>('')
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string>('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    category: 'General',
    tags: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && id) {
      fetch(`/api/events/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.event) {
            const ev = data.event
            setForm({
              title: ev.title || '',
              description: ev.description || '',
              date: toDatetimeLocal(ev.date),
              endDate: ev.endDate ? toDatetimeLocal(ev.endDate) : '',
              location: ev.location || '',
              category: ev.category || 'General',
              tags: (ev.tags || []).join(', '),
            })
            setExistingFlyer(ev.flyer || '')
          } else {
            setError('Event not found.')
          }
        })
        .catch(() => setError('Failed to load event.'))
        .finally(() => setLoading(false))
    }
  }, [status, id, router])

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFlyerFile(file)
    const reader = new FileReader()
    reader.onload = ev => setFlyerPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveFlyer = () => {
    setFlyerFile(null)
    setFlyerPreview('')
    setExistingFlyer('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let flyerUrl = existingFlyer

      if (flyerFile) {
        setUploadingFlyer(true)
        try {
          flyerUrl = await uploadFlyerToCloudinary(flyerFile)
        } finally {
          setUploadingFlyer(false)
        }
      }

      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          flyer: flyerUrl,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.event) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to save changes.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
      setUploadingFlyer(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4">
        <Navbar />
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Event Updated!</h1>
          <p className="text-brass-dim mb-8">Your changes are now live on the Events Board.</p>
          <div className="space-y-3">
            <Link href="/events" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Back to Events Board</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/events" className="text-brass-dim hover:text-brass text-sm">← Events Board</Link>
          <span className="text-brass-dim">/</span>
          <h1 className="font-serif font-bold text-brass text-xl">Edit Event</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="card-cmb rounded-xl p-5 space-y-4">

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Event Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none" />
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
                {['General', 'Lodge Event', 'Social', 'Wedding', 'Party', 'Fundraiser', 'Educational', 'Memorial', 'Installation', 'OES Event'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Flyer — mirrors events/post pattern */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Event Flyer / Photo</label>

              {/* Show existing flyer with option to replace */}
              {(existingFlyer || flyerPreview) && (
                <div className="relative mb-3">
                  <img
                    src={flyerPreview || cloudinaryAutoFormat(existingFlyer)}
                    alt="Event flyer"
                    className="w-full max-h-64 object-contain rounded-xl border border-brass-cmb/30 bg-black/20"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFlyer}
                    className="absolute top-2 right-2 bg-red-900/80 text-red-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    ✕
                  </button>
                  {existingFlyer && !flyerFile && (
                    <label className="absolute bottom-2 right-2 cursor-pointer bg-black/60 text-brass text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors">
                      Replace
                      <input type="file" accept="image/*" onChange={handleFlyerChange} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {/* Upload picker — only show if no flyer yet */}
              {!existingFlyer && !flyerFile && (
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-brass-cmb/30 hover:border-brass-cmb/60 rounded-xl px-4 py-6 transition-all">
                  <span className="text-3xl">🖼️</span>
                  <div className="flex-1">
                    <p className="text-brass text-sm font-semibold">Click to upload flyer or photo</p>
                    <p className="text-brass-dim text-xs">JPG, PNG, HEIC — max 10MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFlyerChange} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="lodge, fundraiser, annual (comma-separated)" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>

          </div>

          {error && <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Link href="/events" className="flex-1 py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm text-center hover:bg-brass-cmb/10 transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={saving || uploadingFlyer} className="flex-1 btn-brass py-3 rounded-xl font-serif font-bold text-sm disabled:opacity-60">
              {uploadingFlyer ? '⬆️ Uploading...' : saving ? 'Saving...' : 'Save Changes →'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
