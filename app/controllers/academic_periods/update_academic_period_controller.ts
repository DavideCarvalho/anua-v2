import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import { updateAcademicPeriodValidator } from '#validators/academic_period'

export default class UpdateAcademicPeriodController {
  async handle({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateAcademicPeriodValidator)

    const academicPeriod = await AcademicPeriod.find(params.id)
    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    const slug = payload.slug ?? (payload.name ? string.slug(payload.name) : undefined)

    if (slug) {
      const existing = await AcademicPeriod.query()
        .where('schoolId', academicPeriod.schoolId)
        .where('slug', slug)
        .whereNot('id', academicPeriod.id)
        .first()

      if (existing) {
        return response.conflict({
          message: 'Já existe um período letivo com este slug nesta escola',
        })
      }
    }

    academicPeriod.merge({
      name: payload.name ?? academicPeriod.name,
      slug: slug ?? academicPeriod.slug,
      startDate: payload.startDate
        ? DateTime.fromJSDate(payload.startDate)
        : academicPeriod.startDate,
      endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : academicPeriod.endDate,
      enrollmentStartDate:
        payload.enrollmentStartDate !== undefined
          ? payload.enrollmentStartDate
            ? DateTime.fromJSDate(payload.enrollmentStartDate)
            : null
          : academicPeriod.enrollmentStartDate,
      enrollmentEndDate:
        payload.enrollmentEndDate !== undefined
          ? payload.enrollmentEndDate
            ? DateTime.fromJSDate(payload.enrollmentEndDate)
            : null
          : academicPeriod.enrollmentEndDate,
      segment: payload.segment ?? academicPeriod.segment,
      previousAcademicPeriodId:
        payload.previousAcademicPeriodId !== undefined
          ? (payload.previousAcademicPeriodId ?? null)
          : academicPeriod.previousAcademicPeriodId,
      minimumGradeOverride:
        payload.minimumGradeOverride !== undefined
          ? (payload.minimumGradeOverride ?? null)
          : academicPeriod.minimumGradeOverride,
      minimumAttendanceOverride:
        payload.minimumAttendanceOverride !== undefined
          ? (payload.minimumAttendanceOverride ?? null)
          : academicPeriod.minimumAttendanceOverride,
      isActive: payload.isActive !== undefined ? payload.isActive : academicPeriod.isActive,
      isClosed: payload.isClosed !== undefined ? payload.isClosed : academicPeriod.isClosed,
    })

    await academicPeriod.save()

    return response.ok(academicPeriod)
  }
}
