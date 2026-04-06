import { Link } from '@inertiajs/react'
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
      className={`group relative flex flex-col items-center justify-center p-6 w-64 h-80 ${color} rounded-[3rem] border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-2 active:translate-y-2 active:shadow-none`}
    >
      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-white uppercase leading-tight drop-shadow-[2px_2px_0px_rgba(15,23,42,1)]">
          {title}
        </h3>
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
    </Link>
  )
}
