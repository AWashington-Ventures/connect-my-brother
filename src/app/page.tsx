import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TutorialButton from '@/components/TutorialButton'

const features = [
  {
    icon: '🔐',
    title: 'Verified Members Only',
    desc: 'Every brother is verified through their current Masonic dues card. Only active Master Masons in good standing may join.'
  },
  {
    icon: '🔍',
    title: 'Searchable Skills Directory',
    desc: 'Enter keywords to find brothers with the skills and services you need. From plumbing to law — the brotherhood has it.'
  },
  {
    icon: '🤝',
    title: 'Private & Secure Connections',
    desc: 'No personal information is displayed publicly. Connect through our secure relay — your email is protected.'
  },
  {
    icon: '🌍',
    title: 'Nationwide Brotherhood',
    desc: 'Masons across the country, connected in one verified network. Find a brother in your city or across the nation.'
  },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/cmb-logo.jpg" alt="Connect My Brother" className="w-52 h-auto rounded-2xl shadow-2xl shadow-brass-cmb/30" />
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold text-5xl sm:text-6xl text-brass mb-4 leading-tight">
            Connect My Brother
          </h1>
          <p className="font-serif text-xl text-brass-dim mb-2">
            connectmybrother.com
          </p>

          <div className="divider-brass max-w-sm mx-auto my-6" />

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-4">
            A private, verified professional network<br />
            exclusively for <span className="text-brass font-semibold">Master Masons</span>.
          </p>
          <p className="text-base text-gray-300 max-w-xl mx-auto mb-10">
            Connect with skilled brothers across the country. Share your expertise.
            Find the services you need within the brotherhood.
          </p>

          {/* Members Only Badge */}
          <div className="inline-block mb-10 px-6 py-3 border border-brass-cmb/50 rounded-lg bg-brass-cmb/10">
            <p className="text-brass font-serif text-sm font-semibold">
              🏛️ This network is for Master Masons ONLY
            </p>
            <p className="text-brass-dim/80 text-xs mt-1">
              All memberships are verified through current Masonic dues cards
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/dues-card" className="btn-brass px-8 py-4 rounded-lg text-lg font-bold font-serif">
              Subscribe Today — $5/month
            </Link>
            <TutorialButton />
            <Link href="/login" className="px-8 py-4 rounded-lg text-lg font-bold font-serif border-2 border-brass-cmb/60 text-brass hover:bg-brass-cmb/10 transition-colors">
              Sign In to My Account
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-brass text-center mb-3">How It Works</h2>
          <p className="text-brass-dim text-center mb-12">Simple. Secure. Brotherhood.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Verify Your Dues Card', desc: 'Submit your current Masonic dues card. Our system verifies you are an active Master Mason in good standing.' },
              { step: '02', title: 'Subscribe & Build Profile', desc: 'Subscribe for $5/month. Create your profile — add your skills, photos, website, and what services you offer.' },
              { step: '03', title: 'Connect With Brothers', desc: 'Search by keyword. Find brothers with the skills you need. Click Connect Now to send a private email introduction.' },
            ].map((item) => (
              <div key={item.step} className="card-cmb rounded-xl p-6 text-center transition-all">
                <div className="text-4xl font-serif font-bold text-brass-cmb/40 mb-3">{item.step}</div>
                <h3 className="font-serif font-bold text-brass text-lg mb-3">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-purple-cmb/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-brass text-center mb-3">Why Connect My Brother?</h2>
          <p className="text-brass-dim text-center mb-12">Built for the brotherhood. By the brotherhood.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-cmb rounded-xl p-6 flex gap-4 transition-all">
                <div className="text-3xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-serif font-bold text-brass text-base mb-2">{f.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERS ONLY NOTICE */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-cmb rounded-2xl p-10 border-2 border-brass-cmb/40">
            <div className="text-4xl mb-4">🏛️</div>
            <h2 className="font-serif font-bold text-brass text-2xl mb-4">Master Masons Only</h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              Connect My Brother is an exclusive network for verified Master Masons.
              To ensure the integrity of our brotherhood, all membership applications
              require submission of a current, valid Masonic dues card.
            </p>
            <p className="text-brass-dim text-sm">
              Your information will be verified before your account is activated.
              Only brothers in good standing with their lodge are admitted.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-brass mb-4">Ready to Connect?</h2>
          <p className="text-gray-300 mb-8">Join Master Masons from across the nation on the only verified Masonic professional network.</p>
          <Link href="/register/dues-card" className="btn-brass px-10 py-5 rounded-lg text-xl font-bold font-serif inline-block">
            Subscribe Today — $5/month
          </Link>
          <p className="text-brass-dim/60 text-xs mt-4">Cancel anytime. Membership requires active dues card verification.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
