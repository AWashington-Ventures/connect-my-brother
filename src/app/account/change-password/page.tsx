'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')
      setSuccess(true)
      // Sign out and redirect to login with fresh session (clears mustChangePassword)
      setTimeout(() => {
        signOut({ callbackUrl: '/login' })
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-md mx-auto mt-8">
        <div className="card-cmb rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/cmb-logo.jpg" alt="Connect My Brother" className="w-20 h-auto rounded-xl" />
          </div>

          <div className="inline-block bg-amber-900/30 border border-amber-500/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-4">
            🔑 PASSWORD RESET REQUIRED
          </div>

          <h1 className="font-serif font-bold text-brass text-2xl mb-3">
            Create Your New Password
          </h1>

          {session?.user?.name && (
            <p className="text-brass-dim text-sm mb-2">
              Welcome, Brother {session.user.name.split(' ')[0]}. Please set a personal password to secure your account.
            </p>
          )}

          {success ? (
            <div className="mt-6">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-green-400 font-serif font-bold text-lg">Password updated!</p>
              <p className="text-brass-dim text-sm mt-2">Signing you in with your new password...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-brass font-serif font-semibold text-sm mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass placeholder-brass-dim/40 focus:outline-none focus:border-brass-cmb"
                />
              </div>
              <div>
                <label className="block text-brass font-serif font-semibold text-sm mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Re-enter your new password"
                  className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-4 py-3 text-brass placeholder-brass-dim/40 focus:outline-none focus:border-brass-cmb"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brass py-4 rounded-lg font-serif font-bold text-lg disabled:opacity-50 mt-2"
              >
                {loading ? 'Updating Password...' : 'Save New Password →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
