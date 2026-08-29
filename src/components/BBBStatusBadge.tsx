// BBBStatusBadge — displays the BBB check result as a compact badge
// Used on seller dashboard and marketplace listing cards

type BBBStatus = 'pending' | 'clear' | 'flagged' | 'not_found' | 'not_checked'

interface BBBStatusBadgeProps {
  status: BBBStatus
  showLabel?: boolean  // show full label or just icon
  className?: string
}

const BBB_CONFIG: Record<BBBStatus, { icon: string; label: string; style: string }> = {
  clear: {
    icon: '✓',
    label: 'BBB Checked',
    style: 'bg-green-900/30 border border-green-500/50 text-green-400',
  },
  flagged: {
    icon: '⚠',
    label: 'BBB Flagged',
    style: 'bg-red-900/30 border border-red-500/50 text-red-400',
  },
  not_found: {
    icon: '○',
    label: 'Not in BBB',
    style: 'bg-yellow-900/20 border border-yellow-600/40 text-yellow-500',
  },
  pending: {
    icon: '⏳',
    label: 'BBB Check Pending',
    style: 'bg-brass-cmb/10 border border-brass-cmb/30 text-brass-dim',
  },
  not_checked: {
    icon: '–',
    label: 'BBB Not Checked',
    style: 'bg-gray-800/40 border border-gray-600/30 text-gray-500',
  },
}

export default function BBBStatusBadge({ status, showLabel = true, className = '' }: BBBStatusBadgeProps) {
  const config = BBB_CONFIG[status] || BBB_CONFIG['not_checked']

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.style} ${className}`}
      title={`BBB Status: ${config.label}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
