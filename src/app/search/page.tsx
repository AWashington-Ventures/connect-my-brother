'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Brother {
  _id: string
  fullName: string
  lodgeName: string
  lodgeNumber: string
  cityState: string
  skills: string[]
  profilePicture?: string
  bio?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Brother[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.members || [])
    } catch(e) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-brass text-4xl mb-3">Find a Brother</h1>
          <p className="text-brass-dim">Search by skill, service, or specialty. Connect with verified Master Masons nationwide.</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-10">
          <input
            className="input-cmb flex-1 px-5 py-4 rounded-xl text-base"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search skills & services — e.g. Real Estate, Plumbing, Legal, IT..."
          />
          <button onClick={search} disabled={loading} className="btn-brass px-8 py-4 rounded-xl font-bold font-serif text-lg">
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-brass font-serif text-xl mb-2">No brothers found for "{query}"</p>
            <p className="text-brass-dim text-sm">Try different keywords or check back as more brothers join the network.</p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-brass-dim text-sm mb-4">{results.length} brother{results.length !== 1 ? 's' : ''} found for "{query}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((b) => (
                <div key={b._id} className="card-cmb rounded-xl p-5 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full border-2 border-brass-cmb overflow-hidden bg-purple-dark flex-shrink-0">
                      {b.profilePicture
                        ? <img src={b.profilePicture} className="w-full h-full object-cover" alt={b.fullName} />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-brass truncate">{b.fullName}</p>
                      <p className="text-brass-dim text-xs">{b.lodgeName} Lodge #{b.lodgeNumber}</p>
                      <p className="text-gray-400 text-xs">{b.cityState}</p>
                    </div>
                  </div>
                  {b.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {b.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-brass-cmb/20 text-brass px-2 py-0.5 rounded-full border border-brass-cmb/30">{s}</span>
                      ))}
                      {b.skills.length > 4 && <span className="text-xs text-brass-dim">+{b.skills.length - 4} more</span>}
                    </div>
                  )}
                  <Link href={`/brothers/${b._id}`} className="btn-brass block text-center py-2 rounded-lg text-sm font-serif font-bold">
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-brass font-serif text-xl mb-2">Search My Brothers</p>
            <p className="text-brass-dim">Enter a skill, trade, or profession above to find verified brothers.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
