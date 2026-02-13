import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'

export default class ShowTurmaPresencasPageController {
  async handle({ inertia, params }: HttpContext) {
    const academicPeriodSlug = params.slug
    const courseSlug = params.cursoSlug
    const classSlug = params.turmaSlug

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

    const classRecord = await Class_.query().where('slug', classSlug).first()

    if (!classRecord) {
      throw AppException.notFound('Turma não encontrada')
    }

    return inertia.render(
      'escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/presencas',
      {
        academicPeriodSlug,
        courseSlug,
        classSlug,
        classId: classRecord.id,
        academicPeriodId: academicPeriod.id,
        courseId: course.id,
        className: classRecord.name,
        courseName: course.name,
        academicPeriodName: academicPeriod.name,
      }
    )
  }
}
