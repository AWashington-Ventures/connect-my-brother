'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      fetch('/api/member/me')
        .then(r => r.json())
        .then(data => { if (data.member) setMember(data.member) })
        .catch(() => {})
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading...</div>
      </main>
    )
  }

  // Build lodge display: "Ionic Lodge #17" if number exists, else "Ionic Lodge"
  const lodgeDisplay = member
    ? `${member.lodgeName}${member.lodgeNumber ? ' #' + member.lodgeNumber : ''}`
    : ''

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-20 h-auto rounded-xl" />
          </div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">
            Welcome, Brother {session?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-brass-dim">
            {lodgeDisplay ? `${lodgeDisplay} — Verified Master Mason` : 'Verified Master Mason'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Link href="/search" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all text-center block">
            <div className="text-3xl mb-3">🔍</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-1">Search My Brothers</h2>
            <p className="text-brass-dim text-sm">Find brothers by skill or service</p>
          </Link>
          <Link href="/brothers" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all text-center block">
            <div className="text-3xl mb-3">🏛️</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-1">Member Directory</h2>
            <p className="text-brass-dim text-sm">Browse all verified members</p>
          </Link>
        </div>

        <div className="mb-4">
          <Link href="/account/profile" className="card-cmb rounded-2xl p-6 hover:border-brass-cmb/60 transition-all flex items-center gap-4 block">
            <div className="text-3xl">✏️</div>
            <div>
              <h2 className="font-serif font-bold text-brass text-lg mb-1">Edit My Profile</h2>
              <p className="text-brass-dim text-sm">Add bio, skills, and keywords for the directory</p>
            </div>
          </Link>
        </div>

        <div className="card-cmb rounded-2xl p-6 mb-4">
          <h2 className="font-serif font-bold text-brass text-lg mb-3">My Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brass-dim">Name</span>
              <span className="text-brass">{member?.fullName || session?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Lodge</span>
              <span className="text-brass">{lodgeDisplay || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Grand Lodge</span>
              <span className="text-brass">{member?.grandLodge || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Email</span>
              <span className="text-brass">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Subscription</span>
              <span className="text-green-400">Active — $5/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brass-dim">Status</span>
              <span className="text-brass">Verified Master Mason ✅</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-2 text-sm text-brass-dim hover:text-brass border border-brass-cmb/20 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}
