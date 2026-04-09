import { Star } from 'lucide-react'
import { DiceBearAvatar } from '../../avatar/dicebear-avatar'

interface KidsStatusBarProps {
  avatar: {
    skinTone: string
    hairStyle: string
    hairColor: string
    outfit: string
    accessories: string[]
  }
  points: number
}

export function KidsStatusBar({ avatar, points }: KidsStatusBarProps) {
  return (
    <div className="relative mb-8 flex w-full max-w-4xl items-center justify-between overflow-hidden rounded-3xl border-4 border-slate-900 bg-white/90 p-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] backdrop-blur-sm dark:bg-slate-800/90">
      {/* Background decorativo interno */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-slate-900 bg-sky-300 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <DiceBearAvatar
            skinTone={avatar.skinTone}
            hairStyle={avatar.hairStyle}
            hairColor={avatar.hairColor}
            outfit={avatar.outfit}
            accessories={avatar.accessories}
            variant="compact"
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-widest text-sky-600 uppercase dark:text-sky-400">
            Estudante Estelar
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-yellow-300 to-amber-500 px-5 py-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform hover:scale-105 active:scale-95">
        <Star className="h-8 w-8 animate-pulse text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        <span className="text-3xl font-black text-slate-900 drop-shadow-sm">{points}</span>
      </div>
    </div>
  )
}
