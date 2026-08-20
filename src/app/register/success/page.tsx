import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SuccessPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-lg mx-auto text-center mt-16">
        <div className="card-cmb rounded-2xl p-10">
          <div className="text-6xl mb-6">🏛️</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-4">Welcome, Brother!</h1>
          <div className="divider-brass mb-6" />
          <p className="text-gray-200 leading-relaxed mb-4">
            Your membership is now active. You are officially part of the
            <span className="text-brass font-semibold"> Connect My Brother</span> network.
          </p>
          <p className="text-brass-dim text-sm mb-8">
            Your profile is live. Brothers can now find you by your skills and services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="btn-brass px-6 py-3 rounded-lg font-serif font-bold">
              Find a Brother
            </Link>
            <Link href="/dashboard" className="btn-outline-brass px-6 py-3 rounded-lg font-serif">
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
