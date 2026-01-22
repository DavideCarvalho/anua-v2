import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'

export default class ShowCursoTurmasPageController {
  async handle({ inertia, params, response }: HttpContext) {
    const academicPeriodSlug = params.slug
    const courseSlug = params.cursoSlug

    // Find the academic period by slug
    const academicPeriod = await AcademicPeriod.query().where('slug', academicPeriodSlug).first()

    if (!academicPeriod) {
      return response.notFound('Período letivo não encontrado')
    }

    // Find the course by slug
    const course = await Course.query().where('slug', courseSlug).first()

    if (!course) {
      return response.notFound('Curso não encontrado')
    }

    // Verify that the course is assigned to this academic period
    const courseAcademicPeriod = await CourseHasAcademicPeriod.query()
      .where('courseId', course.id)
      .where('academicPeriodId', academicPeriod.id)
      .first()

    if (!courseAcademicPeriod) {
      return response.notFound('Curso não está vinculado a este período letivo')
    }

    return inertia.render('escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/index', {
      academicPeriodSlug,
      courseSlug,
      courseId: course.id,
      academicPeriodId: academicPeriod.id,
      courseName: course.name,
      academicPeriodName: academicPeriod.name,
    })
  }
}
