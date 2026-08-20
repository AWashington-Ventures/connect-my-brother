'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function DuesCardPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    grandLodge: '', grandSecretary: '',
    fullName: '', lodgeName: '', lodgeNumber: '',
    secretary: '', cityState: '',
    issuedDate: '', issuedYear: '',
    voidDate: '', voidYear: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register/verify-dues-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      // Store dues card data and redirect to payment
      sessionStorage.setItem('cmb_dues', JSON.stringify(form))
      router.push('/register/subscribe')
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
        {/* Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {['1. Verify Dues Card', '2. Subscribe', '3. Create Profile'].map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded text-xs font-serif ${
              i === 0 ? 'bg-brass-cmb text-purple-dark font-bold' : 'text-brass-dim border border-brass-cmb/30'
            }`}>{s}</div>
          ))}
        </div>

        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">🏛️</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Masonic Dues Card Verification</h1>
            <p className="text-brass-dim text-sm">Please enter your current dues card information exactly as it appears on your card.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PART 1 — Grand Lodge */}
            <div className="border border-brass-cmb/20 rounded-xl p-5">
              <h2 className="font-serif font-bold text-brass text-sm mb-4">PART 1 — Grand Lodge Certification</h2>
              <p className="text-center text-brass text-sm font-serif mb-4">Most Worshipful Prince Hall Grand Lodge, F. & A. M.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>For (Grand Lodge / Jurisdiction) *</label>
                  <input className={inputClass} value={form.grandLodge} onChange={e => update('grandLodge', e.target.value)} placeholder="e.g. District of Columbia" required />
                </div>
                <div>
                  <label className={labelClass}>Grand Secretary Name *</label>
                  <input className={inputClass} value={form.grandSecretary} onChange={e => update('grandSecretary', e.target.value)} placeholder="Grand Secretary full name" required />
                </div>
              </div>
            </div>

            {/* PART 2 — Identification */}
            <div className="border border-brass-cmb/20 rounded-xl p-5">
              <h2 className="font-serif font-bold text-brass text-sm mb-1">PART 2 — Identification Card</h2>
              <p className="text-brass-dim text-xs mb-4">This is to certify that the Brother named herein is a Master Mason in good standing</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Brother (Full Name) *</label>
                  <input className={inputClass} value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Full legal name" required />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className={labelClass}>Lodge Name *</label>
                    <input className={inputClass} value={form.lodgeName} onChange={e => update('lodgeName', e.target.value)} placeholder="e.g. Ionic" required />
                  </div>
                  <div>
                    <label className={labelClass}>Lodge No. *</label>
                    <input className={inputClass} value={form.lodgeNumber} onChange={e => update('lodgeNumber', e.target.value)} placeholder="e.g. 17" required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Lodge Secretary Name *</label>
                  <input className={inputClass} value={form.secretary} onChange={e => update('secretary', e.target.value)} placeholder="Lodge Secretary full name" required />
                </div>
                <div>
                  <label className={labelClass}>City, State *</label>
                  <input className={inputClass} value={form.cityState} onChange={e => update('cityState', e.target.value)} placeholder="e.g. Washington, DC" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date Issued (Month/Day, Year) *</label>
                    <div className="flex gap-2">
                      <input className={inputClass} value={form.issuedDate} onChange={e => update('issuedDate', e.target.value)} placeholder="Nov 1" required />
                      <input className={`${inputClass} w-20`} value={form.issuedYear} onChange={e => update('issuedYear', e.target.value)} placeholder="25" maxLength={2} required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Card Void After (Month/Day, Year) *</label>
                    <div className="flex gap-2">
                      <input className={inputClass} value={form.voidDate} onChange={e => update('voidDate', e.target.value)} placeholder="Oct 31" required />
                      <input className={`${inputClass} w-20`} value={form.voidYear} onChange={e => update('voidYear', e.target.value)} placeholder="26" maxLength={2} required />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-brass w-full py-4 rounded-lg text-lg font-bold font-serif disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify My Dues Card →'}
            </button>

            <p className="text-brass-dim/60 text-xs text-center">
              Your dues card information is used solely for membership verification. It is kept secure and confidential.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
