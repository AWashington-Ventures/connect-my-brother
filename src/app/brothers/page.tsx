'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Member {
  _id: string
  fullName: string
  lodgeName: string
  lodgeNumber?: string
  grandLodge: string
  cityState: string
  profilePicture?: string
  skills: string[]
  bio?: string
  memberSince: string
}

export default function MemberDirectory() {
  const { status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/members')
        .then(r => r.json())
        .then(data => {
          setMembers(data.members || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [status, router])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.lodgeName.toLowerCase().includes(q) ||
      m.grandLodge.toLowerCase().includes(q) ||
      m.cityState.toLowerCase().includes(q) ||
      m.skills.some(s => s.toLowerCase().includes(q))
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-purple-cmb flex items-center justify-center">
        <div className="text-brass font-serif text-xl">Loading Brothers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-cmb text-brass-dim px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-12 h-auto rounded-xl" />
            <h1 className="font-serif font-bold text-brass text-3xl">Member Directory</h1>
          </div>
          <p className="text-brass-dim/70 text-sm">Browse all verified Master Masons on Connect My Brother</p>
          <p className="text-brass/60 text-xs mt-1">{members.length} Verified Member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name, lodge, city, or skills..."
            className="w-full bg-purple-dark/60 border border-brass-cmb/30 rounded-xl px-4 py-3 text-brass placeholder:text-brass-dim/40 focus:outline-none focus:border-brass-cmb/60 text-sm"
          />
        </div>

        {/* Members Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-brass-dim/50">
            {search ? 'No brothers found matching your search.' : 'No members yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(member => (
              <Link key={member._id} href={`/brothers/${member._id}`}
                className="card-cmb rounded-2xl p-4 hover:border-brass-cmb/60 transition-all flex gap-4 items-start">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {member.profilePicture ? (
                    <img src={member.profilePicture} alt={member.fullName}
                      className="w-16 h-16 rounded-xl object-cover border border-brass-cmb/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-purple-dark/60 border border-brass-cmb/20 flex items-center justify-center text-2xl font-bold text-brass/40 font-serif">
                      {member.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-brass font-serif font-bold text-base truncate">{member.fullName}</p>
                  <p className="text-brass-dim/70 text-xs mt-0.5">
                    {member.lodgeName}{member.lodgeNumber ? ` #${member.lodgeNumber}` : ''}
                  </p>
                  <p className="text-brass-dim/50 text-xs">{member.grandLodge}</p>
                  <p className="text-brass-dim/40 text-xs">{member.cityState}</p>
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-xs bg-brass-cmb/10 text-brass-dim border border-brass-cmb/20 rounded-full px-2 py-0.5">{s}</span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="text-xs text-brass-dim/40">+{member.skills.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-brass-dim/30 text-lg">→</div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link href="/dashboard" className="text-brass-dim/50 hover:text-brass text-sm transition-colors">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
