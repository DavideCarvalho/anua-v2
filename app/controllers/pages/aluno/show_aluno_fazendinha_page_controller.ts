import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import StudentGamification from '#models/student_gamification'
import AppException from '#exceptions/app_exception'
import { studentFarmService, FARM_CONFIG } from '#services/farm/student_farm_service'

export default class ShowAlunoFazendinhaPageController {
  async handle({ inertia, auth, effectiveUser, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) throw AppException.invalidCredentials()

    const birthDate = user.birthDate
    const isKids = birthDate ? Math.floor(Math.abs(birthDate.diffNow('years').years)) <= 14 : true
    if (!isKids) {
      // Fazendinha é só pra <=14. Aluno mais velho cai no dashboard normal.
      return response.redirect('/aluno')
    }

    const student = await Student.query().where('id', user.id).preload('user').first()
    if (!student) throw AppException.notFound('Aluno não encontrado')

    const farm = await studentFarmService.getOrCreate(student.id)
    const gamification = await StudentGamification.query().where('studentId', student.id).first()

    return inertia.render('aluno/jogo/fazendinha' as any, {
      student: {
        id: student.id,
        name: student.user?.name ?? 'Aluno',
      },
      farm: {
        seeds: farm.seeds,
        plots: farm.plots,
        pointsEarnedToday: farm.pointsEarnedToday,
        lastDailyAt: farm.lastDailyAt?.toISO() ?? null,
        canClaimDaily: studentFarmService.canClaimDailySeeds(farm),
      },
      gamification: {
        totalPoints: gamification?.totalPoints ?? 0,
        currentLevel: gamification?.currentLevel ?? 1,
        streak: gamification?.streak ?? 0,
      },
      config: {
        plotCount: FARM_CONFIG.PLOT_COUNT,
        dailySeeds: FARM_CONFIG.DAILY_SEEDS,
        pointsPerHarvest: FARM_CONFIG.POINTS_PER_HARVEST,
        dailyPointsCap: FARM_CONFIG.DAILY_POINTS_CAP,
        growDurationSeconds: FARM_CONFIG.GROW_DURATION_SECONDS,
      },
    })
  }
}
