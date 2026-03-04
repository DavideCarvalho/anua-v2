export function Mailbox({ className }: { className?: string }) {
  return (
    <svg
      width="56"
      height="72"
      viewBox="0 0 56 72"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Post/pole */}
      <rect x="24" y="36" width="8" height="30" fill="#8B5E3C" />
      <rect x="24" y="36" width="8" height="30" stroke="#6B3F1F" strokeWidth="1.5" />

      {/* Base */}
      <rect x="18" y="62" width="20" height="6" rx="2" fill="#A0724A" />

      {/* Mailbox body */}
      <rect x="6" y="8" width="44" height="30" rx="6" fill="#7C3AED" />
      <rect x="6" y="8" width="44" height="30" rx="6" stroke="#5B21B6" strokeWidth="2" />

      {/* Rounded top */}
      <path
        d="M6 20 C6 10, 50 10, 50 20"
        fill="#8B5CF6"
        stroke="#5B21B6"
        strokeWidth="2"
      />

      {/* Mail slot */}
      <rect x="14" y="22" width="28" height="4" rx="2" fill="#4C1D95" />

      {/* Flag */}
      <rect x="48" y="12" width="4" height="20" fill="#F59E0B" />
      <polygon points="52,12 52,22 44,17" fill="#F97066" />
      <polygon points="52,12 52,22 44,17" stroke="#E11D48" strokeWidth="1" />

      {/* Letter peeking out */}
      <rect x="18" y="18" width="12" height="8" rx="1" fill="white" opacity="0.8" />
      <line x1="20" y1="20" x2="28" y2="20" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="22" stroke="#CBD5E1" strokeWidth="1" />

      {/* Hard shadow */}
      <ellipse cx="28" cy="68" rx="16" ry="3" fill="#000" opacity="0.1" />
    </svg>
  )
}
