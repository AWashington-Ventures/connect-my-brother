'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function SubscribePage() {
  const router = useRouter()
  const [dues, setDues] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const d = sessionStorage.getItem('cmb_dues')
    if (!d) { router.push('/register/dues-card'); return }
    setDues(JSON.parse(d))
  }, [router])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, dues })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      sessionStorage.setItem('cmb_email', email)
      window.location.href = data.url
    } catch(err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center gap-2 mb-8">
          {['1. Verify Dues Card', '2. Subscribe', '3. Create Profile'].map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded text-xs font-serif ${
              i === 1 ? 'bg-brass-cmb text-purple-dark font-bold' : i < 1 ? 'text-brass border border-brass-cmb/50' : 'text-brass-dim border border-brass-cmb/30'
            }`}>{s}</div>
          ))}
        </div>

        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">✅</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Dues Card Verified!</h1>
            {dues && <p className="text-brass-dim text-sm">Welcome, Brother {dues.fullName}</p>}
            <p className="text-gray-300 text-sm mt-2">Complete your subscription to activate your membership.</p>
          </div>

          <div className="card-cmb rounded-xl p-5 mb-6 text-center border border-brass-cmb/30">
            <p className="text-brass font-serif font-bold text-3xl mb-1">$5<span className="text-lg">/month</span></p>
            <p className="text-brass-dim text-sm">Connect My Brother Membership</p>
            <div className="divider-brass my-3" />
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✅ Verified Masonic network access</li>
              <li>✅ Searchable skills directory</li>
              <li>✅ Unlimited brother connections</li>
              <li>✅ 50% supports Ionic Lodge No. 17</li>
            </ul>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Your Email Address *</label>
              <input
                type="email"
                className="input-cmb w-full px-3 py-3 rounded-lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <p className="text-brass-dim/60 text-xs mt-1">This will be your login email. Keep it private — never shown publicly.</p>
            </div>
            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="btn-brass w-full py-4 rounded-lg text-lg font-bold font-serif disabled:opacity-50">
              {loading ? 'Setting up payment...' : 'Subscribe Now — $5/month →'}
            </button>
            <p className="text-brass-dim/60 text-xs text-center">Powered by Stripe. Secure payment. Cancel anytime.</p>
          </form>
        </div>
      </div>
    </main>
  )
}
