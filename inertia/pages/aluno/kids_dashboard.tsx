import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { KidsStatusBar } from '../../components/aluno/kids/status-bar'
import { KidsModeCard } from '../../components/aluno/kids/mode-card'
import { Utensils, ShoppingBag, Gift } from 'lucide-react'

export default function KidsDashboard({ student, gamification }: any) {
  return (
    <AlunoLayout>
      <Head title="Meu Hub de Prêmios" />
      <div className="flex flex-col items-center py-12 px-4 bg-sky-100 dark:bg-slate-950 min-h-screen">
        <KidsStatusBar student={student} points={gamification.totalPoints} />

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
