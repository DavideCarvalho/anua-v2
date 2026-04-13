import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicSubPeriod from '#models/academic_sub_period'
import { updateAcademicSubPeriodValidator } from '#validators/academic_sub_period'
import AppException from '#exceptions/app_exception'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

export default class UpdateAcademicSubPeriodController {
  async handle({ request, params, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateAcademicSubPeriodValidator)

    const subPeriod = await AcademicSubPeriod.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!subPeriod) {
      throw AppException.notFound('Sub-período letivo não encontrado')
    }

    subPeriod.merge({
      name: payload.name ?? subPeriod.name,
      order: payload.order ?? subPeriod.order,
      startDate: payload.startDate ? DateTime.fromJSDate(payload.startDate) : subPeriod.startDate,
      endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : subPeriod.endDate,
      weight: payload.weight !== undefined ? payload.weight : subPeriod.weight,
      minimumGrade:
        payload.minimumGrade !== undefined
          ? (payload.minimumGrade ?? null)
          : subPeriod.minimumGrade,
      hasRecovery: payload.hasRecovery !== undefined ? payload.hasRecovery : subPeriod.hasRecovery,
      recoveryStartDate:
        payload.recoveryStartDate !== undefined
          ? payload.recoveryStartDate
            ? DateTime.fromJSDate(payload.recoveryStartDate)
            : null
          : subPeriod.recoveryStartDate,
      recoveryEndDate:
        payload.recoveryEndDate !== undefined
          ? payload.recoveryEndDate
            ? DateTime.fromJSDate(payload.recoveryEndDate)
            : null
          : subPeriod.recoveryEndDate,
    })

    await subPeriod.save()

    return serialize(AcademicSubPeriodTransformer.transform(subPeriod))
  }
}
