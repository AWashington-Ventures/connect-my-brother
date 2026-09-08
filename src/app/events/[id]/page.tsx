'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function cloudinaryAutoFormat(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

export default function EventDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
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
    if (status === 'authenticated' && id) {
      fetch(`/api/events/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.event) {
            setEvent(data.event)
          } else {
            setNotFound(true)
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [status, id])

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-brass font-serif text-xl">Loading event...</div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen pt-20 pb-16 px-4">
        <Navbar />
        <div className="max-w-lg mx-auto mt-20 text-center">
          <div className="text-6xl mb-6">🏛️</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Event Not Found</h1>
          <p className="text-brass-dim mb-8">This event may have been removed or the link may be expired.</p>
          <Link href="/events" className="btn-brass px-8 py-3 rounded-xl font-serif font-bold inline-block">
            Browse All Events →
          </Link>
        </div>
      </main>
    )
  }

  if (!event) return null

  const date = new Date(event.date)
  const endDate = event.endDate ? new Date(event.endDate) : null
  const isMyEvent = memberProfile && event.postedBy && String(event.postedBy) === String(memberProfile._id)

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />

      <div className="max-w-2xl mx-auto mt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/events" className="text-brass-dim hover:text-brass transition-colors">← Events Board</Link>
        </div>

        {/* Event Card */}
        <div className="card-cmb rounded-2xl overflow-hidden">

          {/* Flyer */}
          {event.flyer ? (
            <div className="w-full bg-black">
              <img
                src={cloudinaryAutoFormat(event.flyer)}
                alt={event.title}
                className="w-full object-contain max-h-[70vh]"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-brass-cmb/10 flex flex-col items-center justify-center gap-3">
              <img src="/cmb-logo.jpg" alt="" className="w-20 h-20 object-contain opacity-80" />
              <span className="text-brass-dim text-sm font-serif">Connect My Brother</span>
            </div>
          )}

          {/* Event Details */}
          <div className="p-6">

            {/* Category badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-brass-cmb bg-brass-cmb/10 border border-brass-cmb/30 px-3 py-1 rounded-full font-semibold">
                {event.category}
              </span>
              {event.recurrence && event.recurrence !== 'none' && (
                <span className="text-xs text-brass-dim border border-brass-cmb/20 px-2 py-0.5 rounded-full">
                  🔄 {event.recurrence.charAt(0).toUpperCase() + event.recurrence.slice(1)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold text-brass text-2xl sm:text-3xl mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Date & Time */}
            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🗓</span>
                <div>
                  <p className="text-brass font-semibold text-sm">{formatDate(date)}</p>
                  <p className="text-brass-dim text-sm">{formatTime(date)}{endDate ? ` – ${formatTime(endDate)}` : ''}</p>
                  {endDate && endDate.toDateString() !== date.toDateString() && (
                    <p className="text-brass-dim text-xs mt-0.5">Ends {formatDate(endDate)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📍</span>
                <p className="text-brass-dim text-sm pt-0.5">{event.location}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="divider-brass mb-5" />

            {/* Description */}
            <div className="mb-5">
              <h2 className="font-serif font-bold text-brass text-sm uppercase tracking-wider mb-2">About This Event</h2>
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {event.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-brass-dim border border-brass-cmb/20 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Posted by */}
            <div className="bg-brass-cmb/5 border border-brass-cmb/20 rounded-xl p-4 mb-5">
              <p className="text-brass-dim/60 text-xs uppercase tracking-wider mb-1">Posted by</p>
              <p className="text-brass font-serif font-semibold text-sm">{event.postedByName}</p>
              {event.postedByLodge && (
                <p className="text-brass-dim text-xs mt-0.5">🏛️ {event.postedByLodge}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/events"
                className="flex-1 py-3 rounded-xl border border-brass-cmb/40 text-brass font-serif text-sm text-center hover:bg-brass-cmb/10 transition-all"
              >
                ← All Events
              </Link>
              {isMyEvent && (
                <Link
                  href={`/events/${event._id}/edit`}
                  className="flex-1 btn-brass py-3 rounded-xl font-serif font-bold text-sm text-center"
                >
                  ✏️ Edit Event
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
