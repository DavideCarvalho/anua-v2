import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class ShowAcademicPeriodBySlugController {
  async handle({ params, request, response }: HttpContext) {
    const include = request.qs().include?.split(',') ?? []
    const includeCourses = include.includes('courses')

    const query = AcademicPeriod.query().where('slug', params.slug).whereNull('deletedAt')

    if (includeCourses) {
      query.preload('courseAcademicPeriods', (courseQuery) => {
        courseQuery.preload('course')
        courseQuery.preload('levelAssignments', (levelQuery) => {
          levelQuery.preload('level')
        })
      })
    }

    const academicPeriod = await query.first()

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    if (includeCourses) {
      const result = {
        id: academicPeriod.id,
        name: academicPeriod.name,
        slug: academicPeriod.slug,
        startDate: academicPeriod.startDate.toISODate(),
        endDate: academicPeriod.endDate.toISODate(),
        enrollmentStartDate: academicPeriod.enrollmentStartDate?.toISODate() ?? null,
        enrollmentEndDate: academicPeriod.enrollmentEndDate?.toISODate() ?? null,
        isActive: academicPeriod.isActive,
        isClosed: academicPeriod.isClosed,
        segment: academicPeriod.segment,
        courses: academicPeriod.courseAcademicPeriods.map((cap) => ({
          id: cap.id,
          courseId: cap.courseId,
          name: cap.course.name,
          levels: cap.levelAssignments.map((la) => ({
            id: la.id,
            levelId: la.levelId,
            name: la.level.name,
            order: la.level.order,
            contractId: la.level.contractId,
            isActive: la.isActive,
          })),
        })),
      }
      return response.ok(result)
    }

    return response.ok({
      id: academicPeriod.id,
      name: academicPeriod.name,
      slug: academicPeriod.slug,
      startDate: academicPeriod.startDate.toISODate(),
      endDate: academicPeriod.endDate.toISODate(),
      enrollmentStartDate: academicPeriod.enrollmentStartDate?.toISODate() ?? null,
      enrollmentEndDate: academicPeriod.enrollmentEndDate?.toISODate() ?? null,
      isActive: academicPeriod.isActive,
      isClosed: academicPeriod.isClosed,
      segment: academicPeriod.segment,
    })
  }
}
