export default function Footer() {
  return (
    <footer className="border-t border-brass-cmb/20 bg-purple-dark/80 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brass-cmb">
            <img src="/cmb-logo.jpg" alt="CMB" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="font-serif font-bold text-brass text-lg mb-1">Connect My Brother</p>
        <p className="text-brass-dim text-sm mb-4">A Private Network for Master Masons</p>
        <div className="divider-brass max-w-xs mx-auto" />
        <p className="text-brass-dim/60 text-xs mt-4">
          This network is exclusively for verified Master Masons.<br />
          Membership requires valid dues card verification.<br />
          © {new Date().getFullYear()} Connect My Brother | A. Washington Ventures LLC
        </p>
        <p className="text-brass-dim/40 text-xs mt-3 max-w-xl mx-auto leading-relaxed">
          Connect My Brother is an independent service created by a Master Mason. It is not an official body or representative of the Most Worshipful Prince Hall Grand Lodge of the District of Columbia or any constituent lodge.
        </p>
      </div>
    </footer>
  )
}
