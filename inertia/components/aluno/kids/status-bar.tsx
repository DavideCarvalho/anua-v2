import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Star } from 'lucide-react'

export function KidsStatusBar({ student, points }: { student: any; points: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden bg-sky-200">
          <Avatar className="w-full h-full">
            {student.avatar_url && <AvatarImage src={student.avatar_url} alt={student.name} />}
            <AvatarFallback>{student.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estudante Estelar
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-yellow-400 border-4 border-slate-900 rounded-2xl px-4 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <Star className="w-6 h-6 fill-white text-white drop-shadow-sm animate-pulse" />
        <span className="text-2xl font-black text-slate-900">{points}</span>
      </div>
    </div>
  )
}
