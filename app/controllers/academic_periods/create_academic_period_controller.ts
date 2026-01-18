import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import { createAcademicPeriodValidator } from '#validators/academic_period'

export default class CreateAcademicPeriodController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createAcademicPeriodValidator)

    const schoolId = auth.user?.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não possui escola' })
    }

    const slug = payload.slug ?? string.slug(payload.name)

    const existing = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('slug', slug)
      .first()
    if (existing) {
      return response.conflict({
        message: 'Já existe um período letivo com este slug nesta escola',
      })
    }

    const academicPeriod = await AcademicPeriod.create({
      schoolId,
      name: payload.name,
      slug,
      startDate: DateTime.fromJSDate(payload.startDate),
      endDate: DateTime.fromJSDate(payload.endDate),
      enrollmentStartDate: payload.enrollmentStartDate
        ? DateTime.fromJSDate(payload.enrollmentStartDate)
        : null,
      enrollmentEndDate: payload.enrollmentEndDate
        ? DateTime.fromJSDate(payload.enrollmentEndDate)
        : null,
      segment: payload.segment,
      previousAcademicPeriodId: payload.previousAcademicPeriodId ?? null,
      minimumGradeOverride: payload.minimumGradeOverride ?? null,
      minimumAttendanceOverride: payload.minimumAttendanceOverride ?? null,
      isActive: true,
      isClosed: false,
    })

    return response.created(academicPeriod)
  }
}
