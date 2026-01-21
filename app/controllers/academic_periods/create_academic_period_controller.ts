import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import { createAcademicPeriodValidator } from '#validators/academic_period'

export default class CreateAcademicPeriodController {
  async handle({ request, response, auth }: HttpContext) {
    let payload
    try {
      payload = await request.validateUsing(createAcademicPeriodValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const schoolId = payload.schoolId ?? auth.user?.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não possui escola' })
    }

    const academicPeriod = await AcademicPeriod.create({
      schoolId,
      name: payload.name,
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
