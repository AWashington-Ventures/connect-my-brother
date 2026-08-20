'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Suspense } from 'react'

function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Accept email from URL params OR sessionStorage
    const urlEmail = searchParams.get('email')
    const storageEmail = sessionStorage.getItem('cmb_email')
    const resolvedEmail = urlEmail || storageEmail
    if (!resolvedEmail) { router.push('/register/dues-card'); return }
    setEmail(resolvedEmail)
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/register/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set password')

      // Auto sign in
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      sessionStorage.clear()
      if (signInRes?.ok) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-md mx-auto">
        <div className="card-cmb rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/cmb-logo.jpg" alt="CMB" className="w-20 h-auto rounded-xl" />
            </div>
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Create Your Password</h1>
            <p className="text-brass-dim text-sm">You'll use this to log back into Connect My Brother</p>
            {email && <p className="text-brass text-xs mt-2 font-semibold">{email}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm"
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
              className="btn-brass w-full py-3 rounded-lg text-sm font-semibold"
            >
              {loading ? 'Setting Up...' : 'Create Password & Enter'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-brass">Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  )
}
