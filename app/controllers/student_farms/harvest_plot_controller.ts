import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import StudentGamification from '#models/student_gamification'
import AppException from '#exceptions/app_exception'
import { studentFarmService } from '#services/farm/student_farm_service'
import { plotActionValidator } from '#validators/farm'

export default class HarvestPlotController {
  async handle({ auth, effectiveUser, request, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) throw AppException.invalidCredentials()

    const student = await Student.query().where('id', user.id).first()
    if (!student) throw AppException.notFound('Aluno não encontrado')

    const { plotId } = await request.validateUsing(plotActionValidator)

    const { farm, pointsAwarded, seedsAwarded, cappedOut, cropType } =
      await studentFarmService.harvest(student.id, plotId)

    const gamification = await StudentGamification.query().where('studentId', student.id).first()

    return response.ok({
      farm: {
        seeds: farm.seeds,
        plots: farm.plots,
        pointsEarnedToday: farm.pointsEarnedToday,
        lastDailyAt: farm.lastDailyAt?.toISO() ?? null,
        canClaimDaily: studentFarmService.canClaimDailySeeds(farm),
      },
      harvest: {
        cropType,
        pointsAwarded,
        seedsAwarded,
        cappedOut,
      },
      gamification: {
        totalPoints: gamification?.totalPoints ?? 0,
        currentLevel: gamification?.currentLevel ?? 1,
        streak: gamification?.streak ?? 0,
      },
    })
  }
}
