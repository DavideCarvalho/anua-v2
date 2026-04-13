import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicSubPeriod from '#models/academic_sub_period'
import { createAcademicSubPeriodValidator } from '#validators/academic_sub_period'
import AppException from '#exceptions/app_exception'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

export default class StoreAcademicSubPeriodController {
  async handle({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(createAcademicSubPeriodValidator)

    const schoolId = payload.schoolId ?? auth.user?.schoolId
    if (!schoolId) {
      throw AppException.badRequest('Usuário não possui escola')
    }

    const subPeriod = await AcademicSubPeriod.create({
      name: payload.name,
      order: payload.order,
      startDate: DateTime.fromJSDate(payload.startDate),
      endDate: DateTime.fromJSDate(payload.endDate),
      weight: payload.weight ?? 1,
      minimumGrade: payload.minimumGrade ?? null,
      hasRecovery: payload.hasRecovery ?? false,
      recoveryStartDate: payload.recoveryStartDate
        ? DateTime.fromJSDate(payload.recoveryStartDate)
        : null,
      recoveryEndDate: payload.recoveryEndDate
        ? DateTime.fromJSDate(payload.recoveryEndDate)
        : null,
      academicPeriodId: payload.academicPeriodId,
      schoolId,
    })

    return serialize(AcademicSubPeriodTransformer.transform(subPeriod))
  }
}
