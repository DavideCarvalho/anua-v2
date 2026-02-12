import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'

export default class DeleteAcademicPeriodController {
  async handle({ params, auth }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Check if already deleted
    if (academicPeriod.deletedAt) {
      throw AppException.badRequest('Período letivo já foi excluído')
    }

    // Check if user has access to this school
    const schoolId = auth.user?.schoolId
    if (schoolId && academicPeriod.schoolId !== schoolId) {
      throw AppException.forbidden('Sem permissão para excluir este período letivo')
    }

    academicPeriod.deletedAt = DateTime.now()
    await academicPeriod.save()
  }
}
