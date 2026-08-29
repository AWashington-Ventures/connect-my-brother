'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'weywf5mi'
const UPLOAD_PRESET = 'cmb_uploads'

const CATEGORIES = [
  'Auto & Transportation', 'Construction & Home Repair', 'Catering & Food',
  'Clothing & Apparel', 'Consulting & Professional Services', 'Education & Tutoring',
  'Electronics & Technology', 'Event Services', 'Financial & Insurance',
  'Fitness & Wellness', 'Funeral & Memorial Services', 'General Merchandise',
  'Hair & Beauty', 'Legal Services', 'Landscaping & Outdoor', 'Masonic Goods & Regalia',
  'Media & Photography', 'Moving & Storage', 'Music & Entertainment',
  'Real Estate', 'Security Services', 'Other',
]

// Auto-convert Cloudinary HEIC/HEIF to browser-friendly format
function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'listings')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message || 'Image upload failed')
  return data.secure_url
}

export default function EditListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    location: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && id) {
      fetch(`/api/listings/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.listing) {
            const l = data.listing
            setForm({
              title: l.title || '',
              description: l.description || '',
              price: l.price?.toString() || '',
              category: l.category || '',
              condition: l.condition || 'good',
              location: l.location || '',
            })
            setExistingImages(l.images || [])
          } else {
            setError('Listing not found.')
          }
        })
        .catch(() => setError('Failed to load listing.'))
        .finally(() => setLoading(false))
    }
  }, [status, id, router])

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const total = existingImages.length + newImageFiles.length + files.length
    if (total > 5) { setError('Maximum 5 images total.'); return }
    setNewImageFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setNewImagePreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx))
  }

  const removeNewImage = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let allImages = [...existingImages]
      if (newImageFiles.length > 0) {
        setUploadingImages(true)
        const uploaded = await Promise.all(newImageFiles.map(uploadImage))
        allImages = [...existingImages, ...uploaded]
        setUploadingImages(false)
      }

      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images: allImages,
        }),
      })
      const data = await res.json()
      if (data.listing) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to save changes.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
      setUploadingImages(false)
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
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Listing Updated!</h1>
          <p className="text-brass-dim mb-8">Your changes are now live on the marketplace.</p>
          <div className="space-y-3">
            <Link href="/seller/dashboard" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Back to My Listings</Link>
            <Link href="/marketplace" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">View Marketplace</Link>
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
          <Link href="/seller/dashboard" className="text-brass-dim hover:text-brass text-sm">← My Listings</Link>
          <span className="text-brass-dim">/</span>
          <h1 className="font-serif font-bold text-brass text-xl">Edit Listing</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="card-cmb rounded-xl p-5 space-y-4">

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">Price ($) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
              </div>
              <div>
                <label className="block text-brass text-sm font-semibold mb-1">Condition</label>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb">
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Location *</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required placeholder="Washington, DC" className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb" />
            </div>

            {/* Images */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-2">Photos ({existingImages.length + newImagePreviews.length}/5)</label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={cloudinaryAutoFormat(url)} className="w-full h-20 object-cover rounded-lg" alt="" />
                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-900/80 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* New image previews */}
              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {newImagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} className="w-full h-20 object-cover rounded-lg" alt="" />
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-900/80 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add more photos */}
              {(existingImages.length + newImageFiles.length) < 5 && (
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-brass-cmb/30 hover:border-brass-cmb/60 rounded-xl px-4 py-4 transition-all">
                  <span className="text-2xl">📷</span>
                  <p className="text-brass text-sm">Add photos (max 5 total)</p>
                  <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
                </label>
              )}
            </div>

          </div>

          {error && <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Link href="/seller/dashboard" className="flex-1 py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm text-center hover:bg-brass-cmb/10 transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={saving || uploadingImages} className="flex-1 btn-brass py-3 rounded-xl font-serif font-bold text-sm disabled:opacity-60">
              {uploadingImages ? '⬆️ Uploading...' : saving ? 'Saving...' : 'Save Changes →'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
