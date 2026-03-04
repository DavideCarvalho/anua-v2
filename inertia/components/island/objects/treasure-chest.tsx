export function TreasureChest({ className }: { className?: string }) {
  return (
    <svg
      width="72"
      height="64"
      viewBox="0 0 72 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Chest body */}
      <rect x="8" y="28" width="56" height="28" rx="4" fill="#8B5E3C" />
      <rect x="8" y="28" width="56" height="28" rx="4" stroke="#6B3F1F" strokeWidth="2" />

      {/* Wood grain lines */}
      <line x1="12" y1="40" x2="60" y2="40" stroke="#6B3F1F" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="48" x2="60" y2="48" stroke="#6B3F1F" strokeWidth="1" opacity="0.4" />

      {/* Chest lid */}
      <path
        d="M6 30 C6 18, 36 8, 36 8 C36 8, 66 18, 66 30 L66 32 L6 32 Z"
        fill="#A0724A"
        stroke="#6B3F1F"
        strokeWidth="2"
      />

      {/* Metal bands */}
      <rect x="6" y="29" width="60" height="4" fill="#F59E0B" opacity="0.8" />
      <rect x="30" y="8" width="12" height="48" rx="2" fill="#F59E0B" opacity="0.3" />

      {/* Lock/clasp */}
      <rect x="30" y="26" width="12" height="12" rx="2" fill="#FCD34D" />
      <rect x="30" y="26" width="12" height="12" rx="2" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="36" cy="32" r="2" fill="#8B5E3C" />

      {/* Gold sparkle */}
      <circle cx="18" cy="20" r="2" fill="#FCD34D" opacity="0.8" />
      <circle cx="54" cy="22" r="1.5" fill="#FCD34D" opacity="0.6" />

      {/* Hard shadow (pixel-art style, no blur) */}
      <rect x="12" y="56" width="48" height="4" rx="2" fill="#000" opacity="0.1" />
    </svg>
  )
}
