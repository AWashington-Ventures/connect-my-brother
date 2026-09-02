import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const faqs = [
  {
    q: 'What is Connect My Brother?',
    a: 'Connect My Brother is a private, verified professional network exclusively for active Master Masons in good standing. It allows brothers to find each other by skill, offer services, post events, and connect securely within the verified brotherhood.',
  },
  {
    q: 'Who can join?',
    a: 'Only active Master Masons with a current, valid Masonic dues card may join. Every membership is verified during registration. If your dues card is expired or you are not in good standing, you will not be able to complete registration.',
  },
  {
    q: 'Is it really free right now?',
    a: 'Yes — from now through December 31, 2026, all new memberships are completely free as part of our Founding Member offer. No credit card is required to register during this period.',
  },
  {
    q: 'What happens on January 1, 2027?',
    a: 'After December 31, 2026, continued access requires a $5/month or $54/year subscription. Your profile, connections, and all your data are safely preserved. You will be prompted to subscribe when you log in. You can also choose to pay annually and save 10%.',
  },
  {
    q: 'How does dues card verification work?',
    a: 'During registration, you will be asked to enter the information printed on your current Masonic dues card — your lodge name, lodge number, Grand Lodge, issue date, and void date. Our system verifies that the information is consistent with an active, current dues card. Only brothers in good standing may complete registration.',
  },
  {
    q: 'I registered but cannot log in — what do I do?',
    a: 'If you completed your dues card verification but never set a password, visit connectmybrother.com/register/set-password to create your login credentials. Enter your email address and choose a password (8+ characters). If you still have trouble, visit our Help page and send us a message.',
  },
  {
    q: 'I forgot my password — how do I reset it?',
    a: 'Visit connectmybrother.com/register/set-password and enter your registered email address to set a new password. If your email is not recognized, contact us via the Help page and we will assist you directly.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. Connect My Brother does not display your email address, phone number, or personal contact information publicly. When you connect with another brother, our system sends a secure relay email — your real email address is never exposed. Only verified members can view the directory.',
  },
  {
    q: 'How do I connect with a brother?',
    a: 'Use the Search page to find brothers by keyword, skill, or service. When you find a brother you would like to connect with, click the Connect Now button on their profile. Our system will send them a private email introduction on your behalf.',
  },
  {
    q: 'What is the Marketplace?',
    a: 'The Marketplace allows verified Mason members to buy and sell goods and services within the brotherhood. To list your business or products, you need to upgrade to a Marketplace Seller account for $2/month or $22/year. Sellers keep 100% of their sale proceeds — AWV only charges the monthly subscription.',
  },
  {
    q: 'What is the Events Poster add-on?',
    a: 'The Events Poster add-on ($1/month or $11/year) allows you to post event flyers, announcements, lodge events, parties, and more to the CMB & CMS Events Board. Your events are visible to all verified Connect My Brother and Connect My Sister members.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel anytime. Your profile and all your data remain safely preserved after cancellation. If you reactivate later, everything will be right where you left it.',
  },
  {
    q: 'What is Connect My Sister?',
    a: 'Connect My Sister (connectmysister.com) is the sister platform for verified Order of the Eastern Star members. The Marketplace and Events Board are shared between CMB and CMS — meaning brothers and sisters can support each other across both platforms.',
  },
  {
    q: 'Who built this platform?',
    a: 'Connect My Brother was built by Anthony H. Washington, an active Master Mason of Ionic Lodge No. 17 in Washington, DC. It was built for the brotherhood, by the brotherhood.',
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="font-serif font-bold text-brass text-3xl mb-3">Frequently Asked Questions</h1>
          <p className="text-brass-dim">Everything you need to know about Connect My Brother.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="card-cmb rounded-xl border border-brass-cmb/20 group">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="font-serif font-semibold text-brass text-base pr-4">{faq.q}</span>
                <span className="text-brass-cmb text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5">
                <p className="text-gray-300 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 card-cmb rounded-2xl p-8 text-center border border-brass-cmb/30">
          <p className="text-brass font-serif font-semibold mb-2">Still have a question?</p>
          <p className="text-gray-300 text-sm mb-4">Our team is here to help. Send us a message and we will respond promptly.</p>
          <Link href="/help" className="btn-brass px-6 py-3 rounded-lg font-serif font-bold">
            Contact Support →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
