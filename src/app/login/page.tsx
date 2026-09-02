'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reactivated = searchParams.get('reactivated') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })
      if (res?.error) {
        setError('Invalid email or password. Please check your credentials.')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('Login failed. Please try again.')
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
            <h1 className="font-serif font-bold text-brass text-2xl mb-2">Member Login</h1>
            <p className="text-brass-dim text-sm">Active subscribers only</p>
          </div>

          {/* Reactivation success banner */}
          {reactivated && (
            <div className="mb-5 rounded-xl border border-green-500/40 bg-green-900/15 p-4 text-center">
              <p className="text-green-400 font-semibold text-sm">✅ Membership reactivated! Sign in to access your account.</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-brass-dim text-xs font-semibold mb-1 font-serif">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-cmb w-full px-3 py-2 rounded-lg text-sm"
                placeholder="Your password"
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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brass-dim text-xs">
              Not a member yet?{' '}
              <Link href="/register/dues-card" className="text-brass hover:underline">Subscribe Today</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
