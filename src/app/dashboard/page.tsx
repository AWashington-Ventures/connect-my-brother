'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-brass text-3xl mb-2">My Dashboard</h1>
          <p className="text-brass-dim">Welcome to the Connect My Brother network</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/search" className="card-cmb rounded-xl p-6 block hover:scale-105 transition-transform text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-2">Find a Brother</h2>
            <p className="text-brass-dim text-sm">Search the verified Masonic network by skill or service</p>
          </Link>
          <div className="card-cmb rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">👤</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-2">My Profile</h2>
            <p className="text-brass-dim text-sm mb-4">Update your skills, photos, and contact information</p>
            <Link href="/register/profile" className="btn-outline-brass px-4 py-2 rounded text-sm font-serif">Edit Profile</Link>
          </div>
          <div className="card-cmb rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-2">Connections</h2>
            <p className="text-brass-dim text-sm">Brother connections are made via email. Check your inbox for responses.</p>
          </div>
          <div className="card-cmb rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🏛️</div>
            <h2 className="font-serif font-bold text-brass text-lg mb-2">Membership</h2>
            <p className="text-brass-dim text-sm">Active subscription — $5/month</p>
            <p className="text-brass text-xs mt-2">50% supports Ionic Lodge No. 17</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
