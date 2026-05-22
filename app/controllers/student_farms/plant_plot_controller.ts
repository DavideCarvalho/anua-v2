import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import AppException from '#exceptions/app_exception'
import { studentFarmService } from '#services/farm/student_farm_service'
import { plotActionValidator } from '#validators/farm'

export default class PlantPlotController {
  async handle({ auth, effectiveUser, request, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) throw AppException.invalidCredentials()

    const student = await Student.query().where('id', user.id).first()
    if (!student) throw AppException.notFound('Aluno não encontrado')

    const { plotId } = await request.validateUsing(plotActionValidator)

    const farm = await studentFarmService.plant(student.id, plotId)
    return response.ok({
      farm: {
        seeds: farm.seeds,
        plots: farm.plots,
        pointsEarnedToday: farm.pointsEarnedToday,
        lastDailyAt: farm.lastDailyAt?.toISO() ?? null,
        canClaimDaily: studentFarmService.canClaimDailySeeds(farm),
      },
    })
  }
}
