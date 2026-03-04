export function IslandGround() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Floating shadow beneath island */}
      <svg
        className="absolute left-1/2 top-[58%] -translate-x-1/2"
        width="320"
        height="40"
        viewBox="0 0 320 40"
      >
        <ellipse cx="160" cy="20" rx="140" ry="16" fill="#000" opacity="0.12" />
      </svg>

      {/* Island ground */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="island-grass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="island-grass-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#065F56" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        {/* Island shape - organic blob */}
        <path
          d="M80 100 C60 80, 120 40, 200 45 C280 40, 340 80, 330 120 C340 160, 320 200, 260 220 C220 240, 160 245, 120 230 C80 220, 50 180, 55 150 C50 130, 60 110, 80 100 Z"
          className="fill-[url(#island-grass)] stroke-gf-primary-dark dark:fill-[url(#island-grass-dark)] dark:stroke-emerald-900"
          strokeWidth="3"
        />

        {/* Cliff/depth edge */}
        <path
          d="M120 230 C160 245, 220 240, 260 220 C320 200, 340 160, 330 120"
          fill="none"
          className="stroke-gf-primary-dark/40 dark:stroke-emerald-900/40"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Dirt patches */}
        <ellipse cx="180" cy="140" rx="30" ry="12" fill="#D4A574" opacity="0.15" />
        <ellipse cx="250" cy="160" rx="18" ry="8" fill="#D4A574" opacity="0.1" />
      </svg>
    </div>
  )
}
