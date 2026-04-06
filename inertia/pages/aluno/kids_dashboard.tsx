import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { KidsStatusBar } from '../../components/aluno/kids/status-bar'
import { KidsModeCard } from '../../components/aluno/kids/mode-card'
import { Utensils, ShoppingBag, Gift } from 'lucide-react'

interface DashboardProps {
  student: {
    id: string
    name: string
    avatar_url?: string
  }
  gamification?: {
    totalPoints: number
    currentLevel?: number
  }
}

export default function KidsDashboard({ student, gamification }: DashboardProps) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  const firstName = student.name.split(' ')[0]
  const displayStudent = { ...student, name: firstName }

  return (
    <AlunoLayout>
      <Head title="Meu Hub de Prêmios" />
      <div className="flex min-h-screen flex-col items-center bg-sky-100 px-4 py-12 dark:bg-slate-950">
        <KidsStatusBar student={displayStudent as any} points={gamification?.totalPoints ?? 0} />

        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <KidsModeCard
            title="Cantina"
            subtitle="Lanches Deliciosos"
            icon={<Utensils className="w-20 h-20 text-white" />}
            href="/aluno/loja"
            color="bg-orange-500"
          />
          <KidsModeCard
            title="Lojinha"
            subtitle="Itens Incríveis"
            icon={<ShoppingBag className="w-20 h-20 text-white" />}
            href="/aluno/loja"
            color="bg-sky-500"
          />
          <KidsModeCard
            title="Prêmios"
            subtitle="Meus Resgates"
            icon={<Gift className="w-20 h-20 text-white" />}
            href="/aluno/loja/pedidos"
            color="bg-lime-500"
          />
        </div>
      </div>
    </AlunoLayout>
  )
}
