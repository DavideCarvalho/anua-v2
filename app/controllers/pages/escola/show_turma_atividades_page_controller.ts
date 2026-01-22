import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Class_ from '#models/class'

export default class ShowTurmaAtividadesPageController {
  async handle({ inertia, params, response }: HttpContext) {
    const academicPeriodSlug = params.slug
    const courseSlug = params.cursoSlug
    const classSlug = params.turmaSlug

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

    // Find the class by slug
    const classRecord = await Class_.query().where('slug', classSlug).first()

    if (!classRecord) {
      return response.notFound('Turma não encontrada')
    }

    return inertia.render(
      'escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades',
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
