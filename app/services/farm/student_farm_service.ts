import { DateTime } from 'luxon'
import StudentFarm, { type Plot, type CropType } from '#models/student_farm'
import AppException from '#exceptions/app_exception'
import { pointsService } from '#services/gamification/points_service'

export const FARM_CONFIG = {
  PLOT_COUNT: 4,
  INITIAL_SEEDS: 5,
  DAILY_SEEDS: 5,
  POINTS_PER_HARVEST: 3,
  DAILY_POINTS_CAP: 30,
  GROW_DURATION_SECONDS: 120,
  DAILY_COOLDOWN_HOURS: 20,
} as const

const CROP_POOL: CropType[] = ['carrot', 'tomato', 'corn', 'pumpkin', 'eggplant']

function emptyPlots(): Plot[] {
  return Array.from({ length: FARM_CONFIG.PLOT_COUNT }, (_, i) => ({
    id: i,
    state: 'empty' as const,
    cropType: null,
    plantedAt: null,
  }))
}

function pickCrop(): CropType {
  return CROP_POOL[Math.floor(Math.random() * CROP_POOL.length)]
}

function plotIsReady(plot: Plot): boolean {
  if (plot.state !== 'growing' || !plot.plantedAt) return false
  const planted = DateTime.fromISO(plot.plantedAt)
  return DateTime.now().diff(planted, 'seconds').seconds >= FARM_CONFIG.GROW_DURATION_SECONDS
}

export class StudentFarmService {
  async getOrCreate(studentId: string): Promise<StudentFarm> {
    let farm = await StudentFarm.query().where('studentId', studentId).first()
    if (!farm) {
      farm = await StudentFarm.create({
        studentId,
        seeds: FARM_CONFIG.INITIAL_SEEDS,
        plots: emptyPlots(),
        pointsEarnedToday: 0,
        pointsResetAt: DateTime.now().startOf('day'),
        lastDailyAt: null,
      })
    }
    return this.refreshDerivedState(farm)
  }

  private async refreshDerivedState(farm: StudentFarm): Promise<StudentFarm> {
    let dirty = false
    const today = DateTime.now().startOf('day')

    if (!farm.pointsResetAt || farm.pointsResetAt.startOf('day') < today) {
      farm.pointsEarnedToday = 0
      farm.pointsResetAt = today
      dirty = true
    }

    const updatedPlots = farm.plots.map((plot) => {
      if (plot.state === 'growing' && plotIsReady(plot)) {
        dirty = true
        return { ...plot, state: 'ready' as const }
      }
      return plot
    })

    if (dirty) {
      farm.plots = updatedPlots
      await farm.save()
    }
    return farm
  }

  canClaimDailySeeds(farm: StudentFarm): boolean {
    if (!farm.lastDailyAt) return true
    const hoursSince = DateTime.now().diff(farm.lastDailyAt, 'hours').hours
    return hoursSince >= FARM_CONFIG.DAILY_COOLDOWN_HOURS
  }

  async claimDailySeeds(studentId: string): Promise<StudentFarm> {
    const farm = await this.getOrCreate(studentId)
    if (!this.canClaimDailySeeds(farm)) {
      throw AppException.badRequest('Você já pegou suas sementes diárias. Volte amanhã!')
    }
    farm.seeds += FARM_CONFIG.DAILY_SEEDS
    farm.lastDailyAt = DateTime.now()
    await farm.save()
    return farm
  }

  async plant(studentId: string, plotId: number): Promise<StudentFarm> {
    const farm = await this.getOrCreate(studentId)
    const plot = farm.plots.find((p) => p.id === plotId)
    if (!plot) throw AppException.notFound('Canteiro não encontrado')
    if (plot.state !== 'empty') throw AppException.badRequest('Esse canteiro não está vazio')
    if (farm.seeds <= 0) throw AppException.badRequest('Você não tem sementes')

    farm.plots = farm.plots.map((p) =>
      p.id === plotId
        ? {
            ...p,
            state: 'growing' as const,
            cropType: pickCrop(),
            plantedAt: DateTime.now().toISO(),
          }
        : p
    )
    farm.seeds -= 1
    await farm.save()
    return farm
  }

  async harvest(
    studentId: string,
    plotId: number
  ): Promise<{
    farm: StudentFarm
    pointsAwarded: number
    seedsAwarded: number
    cappedOut: boolean
    cropType: CropType
  }> {
    const farm = await this.getOrCreate(studentId)
    const plot = farm.plots.find((p) => p.id === plotId)
    if (!plot) throw AppException.notFound('Canteiro não encontrado')
    if (plot.state !== 'ready') throw AppException.badRequest('Esse canteiro não está pronto')

    const cropType = plot.cropType ?? 'carrot'
    const headroom = Math.max(0, FARM_CONFIG.DAILY_POINTS_CAP - farm.pointsEarnedToday)
    const pointsAwarded = Math.min(FARM_CONFIG.POINTS_PER_HARVEST, headroom)
    const cappedOut = pointsAwarded < FARM_CONFIG.POINTS_PER_HARVEST
    const seedsAwarded = cappedOut ? 2 : 1

    if (pointsAwarded > 0) {
      const gamification = await pointsService.getOrCreateStudentGamification(studentId)
      await pointsService.addPoints({
        studentGamificationId: gamification.id,
        points: pointsAwarded,
        type: 'EARN',
        reason: 'Colheita na Fazendinha',
        relatedEntityType: 'StudentFarm',
        relatedEntityId: farm.id,
      })
      farm.pointsEarnedToday += pointsAwarded
    }

    farm.seeds += seedsAwarded
    farm.plots = farm.plots.map((p) =>
      p.id === plotId ? { id: p.id, state: 'empty', cropType: null, plantedAt: null } : p
    )
    await farm.save()

    return { farm, pointsAwarded, seedsAwarded, cappedOut, cropType }
  }
}

export const studentFarmService = new StudentFarmService()
