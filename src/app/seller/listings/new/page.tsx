'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'weywf5mi'
const UPLOAD_PRESET = 'cmb_uploads'

const CATEGORIES = [
  'Auto & Transportation',
  'Construction & Home Repair',
  'Catering & Food',
  'Clothing & Apparel',
  'Consulting & Professional Services',
  'Education & Tutoring',
  'Electronics & Technology',
  'Event Services',
  'Financial & Insurance',
  'Fitness & Wellness',
  'Funeral & Memorial Services',
  'General Merchandise',
  'Hair & Beauty',
  'Legal Services',
  'Landscaping & Outdoor',
  'Masonic Goods & Regalia',
  'Media & Photography',
  'Moving & Storage',
  'Music & Entertainment',
  'Real Estate',
  'Security Services',
  'Other',
]

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'service', label: 'Service (not a physical item)' },
]

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'marketplace_listings')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message || 'Image upload failed')
  return data.secure_url
}

export default function NewListingPage() {
  const { status } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    location: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imageFiles.length > 5) {
      setError('You can upload a maximum of 5 images.')
      return
    }
    setError('')
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImageFiles(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Please enter a title.'); return }
    if (!form.description.trim()) { setError('Please enter a description.'); return }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Please enter a valid price.'); return }
    if (!form.category) { setError('Please select a category.'); return }
    if (!form.location.trim()) { setError('Please enter a location.'); return }

    setError('')
    setSubmitting(true)

    try {
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        setUploadingImages(true)
        imageUrls = await Promise.all(imageFiles.map(uploadImage))
        setUploadingImages(false)
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images: imageUrls }),
      })
      const data = await res.json()
      if (data.listing) {
        router.push('/seller/dashboard?created=1')
      } else {
        setError(data.error || 'Failed to create listing. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
      setUploadingImages(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/seller/dashboard" className="text-brass-dim text-sm underline">← My Listings</Link>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="font-serif font-bold text-brass text-2xl mb-1">Create New Listing</h1>
          <p className="text-brass-dim text-sm">Visible to all verified Connect My Brother &amp; Connect My Sister members</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card-cmb rounded-2xl p-5 space-y-4">

            {/* Images */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Photos (up to 5)</label>
              <p className="text-brass-dim/70 text-xs mb-2">Upload from your phone gallery, camera, or computer.</p>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageFiles.length < 5 && (
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-brass-cmb/30 hover:border-brass-cmb/60 rounded-xl px-4 py-5 transition-all">
                  <span className="text-2xl">📷</span>
                  <div>
                    <p className="text-brass text-sm font-semibold">Add photos</p>
                    <p className="text-brass-dim text-xs">JPG, PNG — tap to choose from gallery or take a photo</p>
                  </div>
                  {/* accept="image/*" allows camera on mobile, file picker on desktop */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Hand-carved Masonic Square & Compass"
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brass-dim text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required
                  placeholder="0.00"
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg pl-7 pr-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Condition *</label>
              <select
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              >
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Location *</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
                placeholder="e.g. Washington, DC"
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-brass text-sm font-semibold mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
                rows={4}
                placeholder="Describe your item or service in detail..."
                className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none"
              />
            </div>

            {/* Shipping note */}
            <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-3">
              <p className="text-brass-dim text-xs">
                📦 <strong className="text-brass">Shipping note:</strong> Buyer arranges and pays for shipping. You ship after payment is confirmed through the site.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
            <p className="text-brass-dim text-xs leading-relaxed">
              By posting this listing, you agree that <strong className="text-brass">A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold</strong> through this platform. All transactions are solely between the buyer and the seller.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadingImages ? '⬆️ Uploading photos...' :
             submitting ? '⏳ Publishing listing...' :
             'Publish Listing →'}
          </button>
        </form>
      </div>
    </main>
  )
}
