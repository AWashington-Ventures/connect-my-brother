'use client'
import { useState } from 'react'

export default function TutorialButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Tutorial Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg font-bold font-serif border-2 border-brass-cmb/40 text-brass hover:bg-brass-cmb/10 transition-colors"
      >
        <span className="text-xl">▶</span>
        Watch Tutorial
      </button>

      {/* Video Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-semibold flex items-center gap-1"
            >
              ✕ Close
            </button>

            {/* Video Player */}
            <video
              src="/tutorial.mp4"
              controls
              autoPlay
              className="w-full rounded-xl shadow-2xl"
              style={{ maxHeight: '70vh' }}
            />

            <p className="text-center text-brass-dim/70 text-xs mt-3">
              Connect My Brother — Platform Walkthrough
            </p>
          </div>
        </div>
      )}
    </>
  )
}
