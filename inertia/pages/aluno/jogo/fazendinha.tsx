import { Head, router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { api } from '~/lib/api'
import { IslandScene } from '../../../components/aluno/fazendinha/island-scene'
import type { Plot } from '../../../components/aluno/fazendinha/types'
import { Toaster } from 'sonner'

interface FazendinhaProps {
  student: { id: string; name: string }
  farm: {
    seeds: number
    plots: Plot[]
    pointsEarnedToday: number
    lastDailyAt: string | null
    canClaimDaily: boolean
  }
  gamification: { totalPoints: number; currentLevel: number; streak: number }
  config: {
    plotCount: number
    dailySeeds: number
    pointsPerHarvest: number
    dailyPointsCap: number
    growDurationSeconds: number
  }
}

export default function FazendinhaPage(props: FazendinhaProps) {
  const [farm, setFarm] = useState(props.farm)
  const [totalPoints, setTotalPoints] = useState(props.gamification.totalPoints)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(tick)
  }, [])

  const plotsView = useMemo(
    () =>
      farm.plots.map((plot) => {
        if (plot.state !== 'growing' || !plot.plantedAt) return plot
        const plantedMs = new Date(plot.plantedAt).getTime()
        const elapsedSec = (now - plantedMs) / 1000
        if (elapsedSec >= props.config.growDurationSeconds) {
          return { ...plot, state: 'ready' as const }
        }
        return plot
      }),
    [farm.plots, now, props.config.growDurationSeconds]
  )

  const claimMutation = useMutation(api.api.v1.studentFarms.claimDaily.mutationOptions())
  const plantMutation = useMutation(api.api.v1.studentFarms.plant.mutationOptions())
  const harvestMutation = useMutation(api.api.v1.studentFarms.harvest.mutationOptions())

  async function handleClaim() {
    try {
      const res = await claimMutation.mutateAsync({})
      setFarm(res.farm)
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#fcd34d', '#0d9488'],
      })
      toast.success(`+${props.config.dailySeeds} sementes diárias!`)
    } catch (err: any) {
      toast.error(err?.message || 'Não consegui pegar as sementes')
    }
  }

  async function handlePlant(plotId: number) {
    if (farm.seeds <= 0) {
      toast.error('Você não tem sementes. Pegue suas sementes diárias!')
      return
    }
    try {
      const res = await plantMutation.mutateAsync({ body: { plotId } })
      setFarm(res.farm)
    } catch (err: any) {
      toast.error(err?.message || 'Não consegui plantar')
    }
  }

  async function handleHarvest(plotId: number) {
    try {
      const res = await harvestMutation.mutateAsync({ body: { plotId } })
      setFarm(res.farm)
      setTotalPoints(res.gamification.totalPoints)

      if (res.harvest.pointsAwarded > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#f97066', '#fcd34d', '#0d9488', '#7c3aed'],
        })
        toast.success(
          `+${res.harvest.pointsAwarded} ponto${res.harvest.pointsAwarded > 1 ? 's' : ''} ⭐`,
          {
            description: res.harvest.cappedOut
              ? `+${res.harvest.seedsAwarded} sementes (bônus do teto diário!)`
              : `+${res.harvest.seedsAwarded} semente${res.harvest.seedsAwarded > 1 ? 's' : ''}`,
          }
        )
      } else {
        toast.success(`+${res.harvest.seedsAwarded} sementes 🌱`, {
          description: 'Você bateu o teto de pontos hoje. Volte amanhã pra ganhar mais!',
        })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Não consegui colher')
    }
  }

  function handleBuyItem(item: { name: string; cost: number }) {
    if (totalPoints < item.cost) {
      toast.error(`Faltam ${item.cost - totalPoints} pontos pra esse item!`)
      return
    }
    // TODO real purchase API; for now, optimistic local update.
    setTotalPoints((p) => p - item.cost)
    toast.success(`Você comprou: ${item.name}!`, {
      description: `-${item.cost} pontos`,
    })
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#fcd34d', '#7c3aed', '#f97066'],
    })
  }

  return (
    <div className="gamified fixed inset-0 z-0 overflow-hidden bg-[#0f172a]">
      <Head title="Fazendinha" />
      <Toaster richColors position="top-center" />
      <IslandScene
        student={props.student}
        plots={plotsView}
        growDurationSeconds={props.config.growDurationSeconds}
        now={now}
        totalPoints={totalPoints}
        seeds={farm.seeds}
        pointsEarnedToday={farm.pointsEarnedToday}
        dailyPointsCap={props.config.dailyPointsCap}
        canClaimDaily={farm.canClaimDaily}
        onClaimDaily={handleClaim}
        onPlant={handlePlant}
        onHarvest={handleHarvest}
        onBuyItem={handleBuyItem}
        onExit={() => router.visit('/aluno')}
        busy={plantMutation.isPending || harvestMutation.isPending || claimMutation.isPending}
      />
    </div>
  )
}
