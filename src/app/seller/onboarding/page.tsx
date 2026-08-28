'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'weywf5mi'
const UPLOAD_PRESET = 'cmb_uploads'

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'business_licenses')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed')
  return data.secure_url
}

function SellerOnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status } = useSession()
  const sessionId = searchParams.get('session_id') || ''

  const [step, setStep] = useState<'form' | 'uploading' | 'submitting' | 'success' | 'error'>('form')
  const [error, setError] = useState('')
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    businessName: '',
    businessDescription: '',
    disclaimer: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setLicenseFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseFile) { setError('Please upload your business license.'); return }
    if (!form.disclaimer) { setError('Please accept the disclaimer to continue.'); return }
    if (!form.businessName.trim()) { setError('Please enter your business name.'); return }
    // sessionId is optional for existing marketplace sellers re-uploading their license

    setError('')
    setStep('uploading')

    try {
      // Upload license to Cloudinary
      const licenseUrl = await uploadToCloudinary(licenseFile)

      setStep('submitting')

      // Submit onboarding to API
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          businessName: form.businessName,
          businessDescription: form.businessDescription,
          businessLicenseUrl: licenseUrl,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
      } else {
        setError(data.error || 'Onboarding failed. Please contact support.')
        setStep('form')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('form')
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-serif font-bold text-brass text-3xl mb-3">Seller Account Active!</h1>
        <p className="text-brass-dim mb-2">Your business license has been submitted for review. Your listings are now visible to the network.</p>
        <p className="text-brass-dim/60 text-xs mb-8">We'll notify you once your license has been reviewed (usually within 24 hours).</p>
        <div className="space-y-3">
          <Link href="/marketplace" className="block w-full btn-brass py-3 rounded-xl font-serif font-bold">Go to Marketplace →</Link>
          <Link href="/dashboard" className="block w-full py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm hover:bg-brass-cmb/10 transition-all">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="font-serif font-bold text-brass text-2xl mb-2">Complete Your Seller Profile</h1>
        <p className="text-brass-dim text-sm">Payment received! One more step to activate your marketplace account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card-cmb rounded-xl p-5 space-y-4">

          {/* Business Name */}
          <div>
            <label className="block text-brass text-sm font-semibold mb-1">Business Name *</label>
            <input
              value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              required
              placeholder="e.g. Washington Electrical Services LLC"
              className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
            />
          </div>

          {/* Business Description */}
          <div>
            <label className="block text-brass text-sm font-semibold mb-1">What does your business do?</label>
            <textarea
              value={form.businessDescription}
              onChange={e => setForm(f => ({ ...f, businessDescription: e.target.value }))}
              rows={3}
              placeholder="Brief description of your goods or services..."
              className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb resize-none"
            />
          </div>

          {/* Business License Upload */}
          <div>
            <label className="block text-brass text-sm font-semibold mb-1">Business License *</label>
            <p className="text-brass-dim/70 text-xs mb-2">Upload a copy of your current DC, MD, or VA business license (PDF, JPG, or PNG).</p>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-brass-cmb/30 hover:border-brass-cmb/60 rounded-xl px-4 py-6 transition-all">
              <span className="text-3xl">📎</span>
              <div className="flex-1">
                {licenseFile ? (
                  <>
                    <p className="text-brass text-sm font-semibold">{licenseFile.name}</p>
                    <p className="text-brass-dim text-xs">{(licenseFile.size / 1024).toFixed(0)} KB — click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-brass text-sm font-semibold">Click to upload your license</p>
                    <p className="text-brass-dim text-xs">PDF, JPG, or PNG — max 10MB</p>
                  </>
                )}
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-brass-cmb/20 bg-brass-cmb/5 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.disclaimer}
                onChange={e => setForm(f => ({ ...f, disclaimer: e.target.checked }))}
                className="mt-1 accent-amber-500"
              />
              <p className="text-brass-dim text-xs leading-relaxed">
                I acknowledge and agree that <strong className="text-brass">A Washington Ventures LLC is not responsible for the quality of work performed or the condition of merchandise sold</strong> through this platform. All transactions are solely between the buyer and the seller. I confirm my business license is current and valid.
              </p>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={step === 'uploading' || step === 'submitting'}
          className="w-full btn-brass py-3 rounded-xl font-serif font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {step === 'uploading' ? '⬆️ Uploading license...' :
           step === 'submitting' ? '⏳ Activating your account...' :
           'Activate Seller Account →'}
        </button>
      </form>
    </div>
  )
}

export default function SellerOnboardingPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-lg mx-auto mt-16 text-center">
          <p className="text-brass font-serif text-xl">Loading...</p>
        </div>
      }>
        <SellerOnboardingContent />
      </Suspense>
    </main>
  )
}
