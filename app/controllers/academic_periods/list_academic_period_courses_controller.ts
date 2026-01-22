import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class ListAcademicPeriodCoursesController {
  async handle({ params, response }: HttpContext) {
    const academicPeriod = await AcademicPeriod.query()
      .where('id', params.id)
      .preload('courseAcademicPeriods', (courseQuery) => {
        courseQuery.preload('course')
        courseQuery.preload('levelAssignments', (levelQuery) => {
          levelQuery.preload('level')
        })
      })
      .first()

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    const courses = academicPeriod.courseAcademicPeriods.map((cap) => ({
      id: cap.id,
      courseId: cap.courseId,
      name: cap.course.name,
      levels: cap.levelAssignments
        .map((la) => ({
          id: la.id,
          levelId: la.levelId,
          name: la.level.name,
          order: la.level.order,
          contractId: la.level.contractId,
          isActive: la.isActive,
        }))
        .sort((a, b) => a.order - b.order),
    }))

    return response.ok(courses)
  }
}
