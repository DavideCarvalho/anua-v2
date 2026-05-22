import type { ReactNode } from 'react'

type Tone = 'gold' | 'primary' | 'accent' | 'muted'

const TONE_BG: Record<Tone, string> = {
  gold: 'var(--color-gf-gold)',
  primary: 'var(--color-gf-primary)',
  accent: 'var(--color-gf-accent)',
  muted: 'var(--color-gf-secondary)',
}

const TONE_FG: Record<Tone, string> = {
  gold: 'var(--color-gf-navy)',
  primary: 'white',
  accent: 'white',
  muted: 'var(--color-gf-navy)',
}

interface HudStatProps {
  label: string
  value: string | number
  icon: ReactNode
  tone: Tone
}

export function HudStat({ label, value, icon, tone }: HudStatProps) {
  return (
    <div
      className="flex flex-col items-stretch overflow-hidden rounded-2xl border-4 border-[var(--color-gf-navy)] shadow-[0_4px_0_0_var(--color-gf-navy)]"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <div
        className="flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider sm:text-xs"
        style={{ backgroundColor: TONE_BG[tone], color: TONE_FG[tone] }}
      >
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-2 py-2 text-xl font-bold leading-none text-[var(--color-gf-navy)] sm:text-2xl">
        {value}
      </div>
    </div>
  )
}
