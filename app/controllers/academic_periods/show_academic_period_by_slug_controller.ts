import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodDto from '#models/dto/academic_period.dto'

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

    return new AcademicPeriodDto(academicPeriod)
  }
}
