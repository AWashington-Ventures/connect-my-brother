'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function EventModal({ event, onClose }: { event: any; onClose: () => void }) {
  const date = new Date(event.date)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 max-w-lg w-full card-cmb rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {event.flyer && (
          <img src={event.flyer} alt={event.title} className="w-full max-h-80 object-cover" />
        )}
        {!event.flyer && (
          <div className="w-full h-40 bg-brass-cmb/10 flex items-center justify-center">
            <img src="/cmb-logo.jpg" alt="" className="w-20 h-20 object-contain" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <span className="text-xs text-brass-cmb bg-brass-cmb/10 px-2 py-0.5 rounded-full">{event.category}</span>
              <h2 className="font-serif font-bold text-brass text-xl mt-2">{event.title}</h2>
            </div>
            <button onClick={onClose} className="text-brass-dim hover:text-brass ml-4 text-xl">✕</button>
          </div>
          <p className="text-brass text-sm mb-1">🗓 {formatDate(date)} at {formatTime(date)}</p>
          <p className="text-brass-dim text-sm mb-3">📍 {event.location}</p>
          <p className="text-brass-dim text-sm mb-4 leading-relaxed">{event.description}</p>
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map((t: string) => (
                <span key={t} className="text-xs text-brass-dim border border-brass-cmb/20 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
          <p className="text-brass-dim/50 text-xs">Posted by {event.postedByName}{event.postedByLodge ? ` · ${event.postedByLodge}` : ''}</p>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'gallery' | 'calendar'>('gallery')
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [memberProfile, setMemberProfile] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/member/me')
        .then(r => r.json())
        .then(d => { if (d.member) setMemberProfile(d.member) })
        .catch(() => {})
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (locationFilter) params.set('location', locationFilter)
    if (view === 'calendar') { params.set('month', String(calMonth + 1)); params.set('year', String(calYear)) }
    if (selectedDate) params.set('date', selectedDate)
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .finally(() => setLoading(false))
  }, [status, search, locationFilter, selectedDate, calMonth, calYear, view])

  // Calendar helpers
  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay()
    const total = new Date(calYear, calMonth + 1, 0).getDate()
    return { first, total }
  }, [calMonth, calYear])

  const eventDays = useMemo(() => {
    const days = new Set<number>()
    events.forEach(e => {
      const d = new Date(e.date)
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
        days.add(d.getDate())
      }
    })
    return days
  }, [events, calMonth, calYear])

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events
    return events.filter(e => {
      const d = new Date(e.date)
      return d.toDateString() === new Date(selectedDate).toDateString()
    })
  }, [events, selectedDate])

  if (status === 'loading') {
    return <main className="min-h-screen flex items-center justify-center"><div className="text-brass font-serif text-xl">Loading...</div></main>
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <div className="max-w-5xl mx-auto mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-serif font-bold text-brass text-3xl flex items-center gap-3"><img src="/cmb-logo.jpg" alt="" className="w-10 h-10 object-contain rounded-lg inline-block" /> Events Board</h1>
            <p className="text-brass-dim text-sm">Brotherhood & sisterhood events from across the network</p>
          </div>
          <div className="flex gap-2">
            <Link href="/events/post" className="btn-brass px-4 py-2 rounded-lg text-sm font-semibold">+ Post Event</Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card-cmb rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedDate(null) }}
            placeholder="🔍 Search events..."
            className="flex-1 min-w-48 bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
          />
          <input
            value={locationFilter}
            onChange={e => { setLocationFilter(e.target.value); setSelectedDate(null) }}
            placeholder="📍 Location"
            className="w-36 bg-purple-dark/60 border border-brass-cmb/30 rounded-lg px-3 py-2 text-brass text-sm focus:outline-none focus:border-brass-cmb"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="text-brass-dim text-xs border border-brass-cmb/30 px-3 py-2 rounded-lg hover:border-brass-cmb/60 transition-all">
              Clear date filter ✕
            </button>
          )}
          {/* View Toggle */}
          <div className="flex border border-brass-cmb/30 rounded-lg overflow-hidden">
            <button onClick={() => setView('gallery')} className={`px-3 py-2 text-xs font-semibold transition-all ${view === 'gallery' ? 'bg-brass-cmb/20 text-brass' : 'text-brass-dim hover:text-brass'}`}>🖼 Gallery</button>
            <button onClick={() => setView('calendar')} className={`px-3 py-2 text-xs font-semibold transition-all ${view === 'calendar' ? 'bg-brass-cmb/20 text-brass' : 'text-brass-dim hover:text-brass'}`}>📆 Calendar</button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="card-cmb rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }} className="text-brass-dim hover:text-brass text-lg px-2">‹</button>
              <h2 className="font-serif font-bold text-brass">{MONTHS[calMonth]} {calYear}</h2>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }} className="text-brass-dim hover:text-brass text-lg px-2">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-brass-dim/60 text-xs text-center py-1 font-semibold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calDays.first }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: calDays.total }, (_, i) => {
                const day = i + 1
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const hasEvents = eventDays.has(day)
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative aspect-square rounded-lg text-sm font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected ? 'bg-brass-cmb text-purple-dark' :
                      hasEvents ? 'border border-brass-cmb/40 text-brass hover:bg-brass-cmb/10' :
                      'text-brass-dim/50 hover:text-brass-dim'
                    }`}
                  >
                    {day}
                    {hasEvents && !isSelected && <span className="w-1 h-1 rounded-full bg-brass-cmb absolute bottom-1" />}
                  </button>
                )
              })}
            </div>
            {selectedDate && (
              <p className="text-brass-dim text-xs mt-3 text-center">
                Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} on {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16 text-brass-dim">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="card-cmb rounded-2xl p-12 text-center">
            <div className="mb-4"><img src="/cmb-logo.jpg" alt="" className="w-16 h-16 object-contain mx-auto opacity-70" /></div>
            <h2 className="font-serif font-bold text-brass text-xl mb-2">
              {selectedDate ? 'No events on this day' : search ? 'No events found' : 'No events yet'}
            </h2>
            <p className="text-brass-dim text-sm mb-6">
              {selectedDate ? 'Select another day or clear the filter.' : 'Be the first to post an event for the network!'}
            </p>
            <Link href="/events/post" className="inline-block btn-brass px-6 py-2 rounded-xl font-serif text-sm font-bold">Post an Event →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredEvents.map(event => {
              const isMyEvent = memberProfile && event.postedBy && String(event.postedBy) === String(memberProfile._id)
              return (
                <div key={event._id} className="relative group">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="card-cmb rounded-xl overflow-hidden hover:border-brass-cmb/60 transition-all text-left w-full"
                  >
                    {event.flyer ? (
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={event.flyer} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-brass-cmb/10 flex flex-col items-center justify-center gap-2">
                        <img src="/cmb-logo.jpg" alt="" className="w-12 h-12 object-contain opacity-80" />
                        <span className="text-brass text-xs font-semibold px-2 text-center">{event.category}</span>
                      </div>
                    )}
                    <div className="p-2">
                      <p className="font-serif font-bold text-brass text-xs leading-tight line-clamp-2">{event.title}</p>
                      <p className="text-brass-dim text-xs mt-1">{formatDate(new Date(event.date))}</p>
                      <p className="text-brass-dim/60 text-xs truncate">📍 {event.location}</p>
                    </div>
                  </button>
                  {isMyEvent && (
                    <Link
                      href={`/events/${event._id}/edit`}
                      className="absolute top-2 right-2 bg-black/70 text-brass text-xs px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 z-10"
                      onClick={e => e.stopPropagation()}
                    >
                      ✏️ Edit
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Post CTA — only show for viewer-tier members */}
        {memberProfile?.eventsTier !== 'poster' && (
          <div className="mt-8 card-cmb rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-brass text-sm font-semibold">Want to post events?</p>
              <p className="text-brass-dim text-xs">$1/month — post flyers & announcements to the entire network</p>
            </div>
            <Link href="/events/upgrade" className="btn-brass px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">Upgrade →</Link>
          </div>
        )}
      </div>
    </main>
  )
}
