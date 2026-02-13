import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import AppException from '#exceptions/app_exception'

export default class ShowCursoVisaoGeralPageController {
  async handle({ inertia, params }: HttpContext) {
    const academicPeriodSlug = params.slug
    const courseSlug = params.cursoSlug

    // Find the academic period by slug
    const academicPeriod = await AcademicPeriod.query().where('slug', academicPeriodSlug).first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Find the course by slug
    const course = await Course.query().where('slug', courseSlug).first()

    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    // Verify that the course is assigned to this academic period
    const courseAcademicPeriod = await CourseHasAcademicPeriod.query()
      .where('courseId', course.id)
      .where('academicPeriodId', academicPeriod.id)
      .first()

    if (!courseAcademicPeriod) {
      throw AppException.notFound('Curso não está vinculado a este período letivo')
    }

    return inertia.render('escola/periodos-letivos/[slug]/cursos/[cursoSlug]/visao-geral', {
      academicPeriodSlug,
      courseSlug,
      courseId: course.id,
      academicPeriodId: academicPeriod.id,
      courseName: course.name,
      academicPeriodName: academicPeriod.name,
    })
  }
}
