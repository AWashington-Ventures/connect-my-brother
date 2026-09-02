'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-dark/90 backdrop-blur-md border-b border-brass-cmb/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-full h-full object-cover" />
          </div>
          <span className="text-brass font-serif font-bold text-lg hidden sm:block">Connect My Brother</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <>
              <Link href="/search" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">Find a Brother</Link>
              <Link href="/marketplace" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">Marketplace</Link>
              <Link href="/events" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">Events</Link>
              <Link href="/dashboard" className="btn-brass px-4 py-2 rounded text-sm">My Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/#about" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">About</Link>
              <Link href="/faq" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">FAQ</Link>
              <Link href="/help" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">Help</Link>
              <Link href="/login" className="text-brass-dim hover:text-brass transition-colors font-serif text-sm">Login</Link>
              <Link href="/register/dues-card" className="btn-brass px-4 py-2 rounded text-sm">Subscribe Today</Link>
            </>
          )}
        </div>
        <button className="md:hidden text-brass" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-purple-dark border-t border-brass-cmb/20 p-4 flex flex-col gap-4">
          {session ? (
            <>
              <Link href="/search" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>Find a Brother</Link>
              <Link href="/marketplace" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>Marketplace</Link>
              <Link href="/events" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>Events</Link>
              <Link href="/dashboard" className="btn-brass px-4 py-2 rounded text-sm text-center" onClick={() => setOpen(false)}>My Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/#about" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>About</Link>
              <Link href="/faq" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>FAQ</Link>
              <Link href="/help" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>Help</Link>
              <Link href="/login" className="text-brass-dim font-serif" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register/dues-card" className="btn-brass px-4 py-2 rounded text-sm text-center" onClick={() => setOpen(false)}>Subscribe Today</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
