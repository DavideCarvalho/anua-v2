export function BackpackItem({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="68"
      viewBox="0 0 64 68"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Strap loop */}
      <path
        d="M22 8 C22 2, 42 2, 42 8"
        fill="none"
        stroke="#E11D48"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Main body */}
      <rect x="10" y="12" width="44" height="44" rx="8" fill="#F97066" />
      <rect x="10" y="12" width="44" height="44" rx="8" stroke="#E11D48" strokeWidth="2" />

      {/* Front pocket */}
      <rect x="16" y="32" width="32" height="18" rx="4" fill="#FB923C" />
      <rect x="16" y="32" width="32" height="18" rx="4" stroke="#E11D48" strokeWidth="1.5" />

      {/* Pocket flap */}
      <path d="M16 36 L48 36" stroke="#E11D48" strokeWidth="1.5" />

      {/* Clasp/buckle */}
      <rect x="28" y="28" width="8" height="6" rx="1" fill="#FCD34D" />
      <rect x="28" y="28" width="8" height="6" rx="1" stroke="#F59E0B" strokeWidth="1.5" />

      {/* Straps hanging */}
      <rect x="18" y="56" width="4" height="6" rx="1" fill="#E11D48" />
      <rect x="42" y="56" width="4" height="6" rx="1" fill="#E11D48" />

      {/* Zipper detail */}
      <line x1="22" y1="22" x2="42" y2="22" stroke="#E11D48" strokeWidth="1" opacity="0.5" />

      {/* Hard shadow */}
      <ellipse cx="32" cy="62" rx="18" ry="3" fill="#000" opacity="0.1" />
    </svg>
  )
}
