import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { KidsStatusBar } from '../../components/aluno/kids/status-bar'
import { KidsModeCard } from '../../components/aluno/kids/mode-card'
import { Utensils, ShoppingBag, Gift, Award } from 'lucide-react'

interface DashboardProps {
  student: {
    id: string
    name: string
  }
  avatar: {
    skinTone: string
    hairStyle: string
    hairColor: string
    outfit: string
    accessories: string[]
  }
  gamification: {
    totalPoints: number
    currentLevel: number
    levelProgress: number
    streak: number
  }
  recentAchievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    rarity: string
    unlockedAt: string
  }>
}

export default function KidsDashboard({
  student,
  avatar,
  gamification,
  recentAchievements,
}: DashboardProps) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  const firstName = student.name.split(' ')[0]

  return (
    <AlunoLayout>
      <Head title="Meu Hub de Prêmios" />
      <div className="relative flex min-h-screen flex-col items-center bg-sky-100 px-4 py-12 dark:bg-slate-950">
        {/* Padrão de bolinhas no fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] opacity-[0.15] bg-[length:32px_32px] pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center">
          <h1 className="sr-only">Olá, {firstName}!</h1>
          <KidsStatusBar avatar={avatar} points={gamification?.totalPoints ?? 0} />

          <div className="mt-8 flex flex-wrap justify-center gap-10">
            <KidsModeCard
              title="Cantina"
              subtitle="Lanches Deliciosos"
              icon={<Utensils className="h-20 w-20 text-white" />}
              href="/aluno/loja"
              color="bg-gradient-to-br from-orange-400 to-red-600"
            />
            <KidsModeCard
              title="Lojinha"
              subtitle="Itens Incríveis"
              icon={<ShoppingBag className="h-20 w-20 text-white" />}
              href="/aluno/loja"
              color="bg-gradient-to-br from-sky-400 to-indigo-600"
            />
            <KidsModeCard
              title="Prêmios"
              subtitle="Meus Resgates"
              icon={<Gift className="h-20 w-20 text-white" />}
              href="/aluno/loja/pedidos"
              color="bg-gradient-to-br from-lime-400 to-emerald-600"
            />
          </div>

          {recentAchievements.length > 0 && (
            <div className="mt-20 w-full max-w-4xl rounded-[3rem] border-4 border-slate-900 bg-white/50 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] backdrop-blur-sm dark:bg-slate-900/50">
              <h2 className="mb-8 flex items-center gap-3 text-3xl font-black text-slate-900 uppercase dark:text-white">
                <div className="rounded-2xl bg-yellow-400 p-2 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Award className="h-8 w-8 text-white fill-white" />
                </div>
                Conquistas Épicas
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="group flex flex-col items-center rounded-3xl border-4 border-slate-900 bg-white p-6 text-center shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-transform hover:scale-105 dark:bg-slate-800"
                  >
                    <div className="mb-4 text-5xl transition-transform group-hover:rotate-12">
                      {achievement.icon}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase dark:text-white leading-tight">
                      {achievement.name}
                    </h3>
                    <div className="mt-2 h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <p className="mt-3 text-[11px] font-bold leading-tight text-slate-500 uppercase">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AlunoLayout>
  )
}
