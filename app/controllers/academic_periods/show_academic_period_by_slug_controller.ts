import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import { showAcademicPeriodBySlugQueryValidator } from '#validators/academic_period'

export default class ShowAcademicPeriodBySlugController {
  async handle({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(showAcademicPeriodBySlugQueryValidator)
    const include = payload.include?.split(',') ?? []
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
      throw AppException.notFound('Período letivo não encontrado')
    }

    return serialize(AcademicPeriodTransformer.transform(academicPeriod))
  }
}
