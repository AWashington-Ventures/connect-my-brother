'use client'
import { useEffect, useState } from 'react'

const TARGET = new Date('2027-01-01T00:00:00-05:00').getTime()

function getTimeLeft() {
  const now = Date.now()
  const diff = TARGET - now
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function FoundingMemberCountdown() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="border border-brass-cmb bg-brass-cmb/10 rounded-2xl px-6 py-5 text-center">
        <p className="text-brass font-serif font-bold text-sm mb-3 uppercase tracking-wider">
          🎉 Free Founding Member Access Ends In:
        </p>
        <div className="flex justify-center gap-4">
          {[['Days', time.days], ['Hours', time.hours], ['Mins', time.minutes], ['Secs', time.seconds]].map(
            ([label, val]) => (
              <div key={label as string} className="flex flex-col items-center">
                <div className="bg-brass-cmb/20 border border-brass-cmb/50 rounded-xl w-16 h-14 flex items-center justify-center">
                  <span className="text-brass font-serif font-bold text-2xl leading-none">
                    {pad(val as number)}
                  </span>
                </div>
                <span className="text-brass-dim text-xs mt-1 font-semibold uppercase tracking-wide">{label}</span>
              </div>
            )
          )}
        </div>
        <p className="text-brass-dim/80 text-xs mt-3">
          Join free now — then just $5/month after January 1, 2027
        </p>
      </div>
    </div>
  )
}
