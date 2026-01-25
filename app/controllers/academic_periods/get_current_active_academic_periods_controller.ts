import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodDto from '#models/dto/academic_period.dto'

export default class GetCurrentActiveAcademicPeriodsController {
  async handle({ auth, response }: HttpContext) {
    const schoolId = auth.user?.schoolId

    if (!schoolId) {
      return response.ok([])
    }

    const periods = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .whereNull('deletedAt')
      .orderBy('startDate', 'desc')

    return AcademicPeriodDto.fromArray(periods)
  }
}
