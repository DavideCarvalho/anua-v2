export function MarketStall({ className }: { className?: string }) {
  return (
    <svg
      width="80"
      height="72"
      viewBox="0 0 80 72"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Awning poles */}
      <rect x="12" y="24" width="4" height="40" fill="#8B5E3C" />
      <rect x="64" y="24" width="4" height="40" fill="#8B5E3C" />

      {/* Counter/table */}
      <rect x="8" y="48" width="64" height="16" rx="3" fill="#A0724A" />
      <rect x="8" y="48" width="64" height="16" rx="3" stroke="#6B3F1F" strokeWidth="2" />
      <line x1="12" y1="56" x2="68" y2="56" stroke="#6B3F1F" strokeWidth="1" opacity="0.3" />

      {/* Goods on counter */}
      <circle cx="28" cy="46" r="4" fill="#0D9488" opacity="0.7" />
      <circle cx="40" cy="45" r="5" fill="#F97066" opacity="0.7" />
      <circle cx="52" cy="46" r="4" fill="#FCD34D" opacity="0.7" />

      {/* Awning - striped teal/white */}
      <path
        d="M4 26 C4 10, 40 2, 40 2 C40 2, 76 10, 76 26 L76 28 L4 28 Z"
        fill="#0D9488"
        stroke="#065F56"
        strokeWidth="2"
      />
      {/* Stripes */}
      <path d="M16 24 L22 6" stroke="white" strokeWidth="3" opacity="0.4" />
      <path d="M32 22 L36 4" stroke="white" strokeWidth="3" opacity="0.4" />
      <path d="M48 22 L44 4" stroke="white" strokeWidth="3" opacity="0.4" />
      <path d="M64 24 L58 6" stroke="white" strokeWidth="3" opacity="0.4" />

      {/* Scalloped edge */}
      <path
        d="M4 27 Q10 32 16 27 Q22 32 28 27 Q34 32 40 27 Q46 32 52 27 Q58 32 64 27 Q70 32 76 27"
        fill="none"
        stroke="#065F56"
        strokeWidth="2"
      />

      {/* Hard shadow */}
      <rect x="12" y="64" width="56" height="4" rx="2" fill="#000" opacity="0.1" />
    </svg>
  )
}
