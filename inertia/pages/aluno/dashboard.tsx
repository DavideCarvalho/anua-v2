import { motion } from 'framer-motion'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { ShoppingBag, UtensilsCrossed, Trophy } from 'lucide-react'

import { RpgCanvas } from '../../components/rpg/rpg-canvas'
import { staggerContainer, fadeUp } from '../../lib/gamified-animations'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  rarity: string
  unlockedAt: string
}

interface DashboardProps {
  gamified: boolean
  student: { id: string; name: string }
  recentAchievements?: Achievement[]
  avatar: {
    id: string
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
}

const rarityGlow: Record<string, string> = {
  common: 'border-gray-300 dark:border-gray-600',
  rare: 'border-gf-primary shadow-[0_0_8px_rgba(13,148,136,0.3)]',
  epic: 'border-gf-purple shadow-[0_0_8px_rgba(124,58,237,0.3)]',
  legendary: 'border-gf-gold-dark shadow-[0_0_8px_rgba(245,158,11,0.3)]',
}

export default function AlunoDashboardPage({
  gamified,
  student,
  avatar,
  gamification,
  recentAchievements = [],
}: DashboardProps) {
  return (
    <AlunoLayout>
      <Head title={gamified ? 'Meu Cantinho' : 'Início'} />
      <div className={gamified ? 'flex min-h-0 flex-1 flex-col' : 'space-y-6'}>
        {!gamified && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Olá, {student.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">Acesse a loja e seus pedidos</p>
          </div>
        )}

        {gamified ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="relative flex min-h-0 flex-1 flex-col"
          >
            {/* RPG Canvas — fixed full viewport (Gather/Pokemon style) */}
            <motion.div variants={fadeUp} className="fixed inset-0 top-16 bottom-14 lg:bottom-0">
              <RpgCanvas avatar={avatar} gamification={gamification} className="h-full w-full" />
            </motion.div>

            {/* Recent Achievements — floating strip at bottom */}
            {recentAchievements.length > 0 && (
              <motion.div
                variants={fadeUp}
                className="fixed bottom-16 left-2 right-2 z-20 lg:bottom-4 lg:left-4 lg:right-auto"
              >
                <div className="rounded-xl border-2 border-gf-primary/20 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:bg-gf-navy/95">
                  <h3 className="mb-2 font-display text-xs font-bold text-gf-primary-dark dark:text-gf-primary-light">
                    Conquistas Recentes
                  </h3>
                  <div className="flex gap-2 overflow-x-auto">
                    {recentAchievements.map((a) => (
                      <div
                        key={a.id}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 bg-white px-2.5 py-1 dark:bg-gf-navy/60 ${rarityGlow[a.rarity] ?? rarityGlow.common}`}
                      >
                        <Trophy className="size-4 text-gf-gold-dark" />
                        <span className="font-body text-xs font-semibold">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/aluno/loja">
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingBag className="h-5 w-5" />
                      Loja
                    </CardTitle>
                    <CardDescription>Explore as lojas disponíveis e faça pedidos</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/aluno/loja/pedidos">
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UtensilsCrossed className="h-5 w-5" />
                      Meus Pedidos
                    </CardTitle>
                    <CardDescription>Acompanhe o status dos seus pedidos</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </AlunoLayout>
  )
}
