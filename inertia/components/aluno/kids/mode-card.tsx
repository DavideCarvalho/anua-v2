import { Link } from '@adonisjs/inertia/react'
import { ReactNode } from 'react'

interface KidsModeCardProps {
  title: string
  subtitle: string
  icon: ReactNode
  href: string
  color: string // Tailwind color class like 'bg-orange-500'
}

export function KidsModeCard({ title, subtitle, icon, href, color }: KidsModeCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex h-80 w-64 flex-col items-center justify-center overflow-hidden rounded-[3rem] border-4 border-slate-900 ${color} p-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-2 active:translate-y-2 active:shadow-none`}
    >
      {/* Reflexo vítreo no topo do card */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

      {/* Brilho interno */}
      <div className="absolute inset-2 rounded-[2.5rem] border-2 border-white/20 pointer-events-none" />

      <div className="relative z-10 mb-4 text-6xl transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
        {icon}
      </div>
      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-black leading-tight text-white uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
          {title}
        </h3>
        <p className="mt-1 text-xs font-bold tracking-widest text-white/90 uppercase">{subtitle}</p>
      </div>
    </Link>
  )
}
