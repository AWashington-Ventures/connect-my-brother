'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

function CreateAccountContent() {
  const router = useRouter()
  const [dues, setDues] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const d = sessionStorage.getItem('cmb_dues')
    if (!d) {
      router.push('/register/dues-card')
      return
    }
    setDues(JSON.parse(d))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/register/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password, dues })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Account creation failed.')
      sessionStorage.setItem('cmb_email', email.toLowerCase().trim())
      // Use FREE_2027 token so profile page can complete the member record
      router.push('/register/profile?session_id=FREE_2027')
    } catch (err: any) {
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
      <div className="max-w-md mx-auto">
        {/* Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {['1. Verify Dues Card', '2. Create Account', '3. Complete Profile'].map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded text-xs font-serif ${
              i === 1 ? 'bg-brass-cmb text-purple-dark font-bold' : 'text-brass-dim border border-brass-cmb/30'
            }`}>{s}</div>
          ))}
        </div>

        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/cmb-logo.jpg" alt="CMB" className="w-20 h-auto rounded-xl" />
            </div>
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Create Your Account</h1>
            <p className="text-brass-dim text-sm">Your email is your username. Create a secure password to access Connect My Brother.</p>
            {dues && (
              <p className="text-brass text-xs mt-3 font-semibold">
                Welcome, Brother {dues.fullName} &mdash; {dues.lodgeName} {dues.lodgeNumber ? `#${dues.lodgeNumber}` : ''}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Email Address (your username)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Create Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={inputClass}
                placeholder="Re-enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brass w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-brass">Loading...</div>}>
      <CreateAccountContent />
    </Suspense>
  )
}
