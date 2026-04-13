import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicSubPeriod from '#models/academic_sub_period'
import AppException from '#exceptions/app_exception'

export default class DestroyAcademicSubPeriodController {
  async handle({ params, auth }: HttpContext) {
    const subPeriod = await AcademicSubPeriod.find(params.id)

    if (!subPeriod) {
      throw AppException.notFound('Sub-período letivo não encontrado')
    }

    if (subPeriod.deletedAt) {
      throw AppException.badRequest('Sub-período letivo já foi excluído')
    }

    const schoolId = auth.user?.schoolId
    if (schoolId && subPeriod.schoolId !== schoolId) {
      throw AppException.forbidden('Sem permissão para excluir este sub-período letivo')
    }

    subPeriod.deletedAt = DateTime.now()
    await subPeriod.save()
  }
}
