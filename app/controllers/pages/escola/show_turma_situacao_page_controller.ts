import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Class_ from '#models/class'
import TeacherHasClass from '#models/teacher_has_class'

export default class ShowTurmaSituacaoPageController {
  async handle({ inertia, params, response, auth }: HttpContext) {
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

    const classRecord = await Class_.query().where('slug', classSlug).first()

    if (!classRecord) {
      return response.notFound('Turma não encontrada')
    }

    // Get subjects for this class (teacher-class associations)
    const teacherClasses = await TeacherHasClass.query()
      .where('classId', classRecord.id)
      .where('isActive', true)
      .preload('subject')
      .preload('teacher', (teacherQuery) => {
        teacherQuery.preload('user')
      })

    // Extract unique subjects with teacher info
    const subjectsMap = new Map<
      string,
      { id: string; name: string; slug: string; teacherUserId: string }
    >()
    for (const tc of teacherClasses) {
      if (tc.subject && !subjectsMap.has(tc.subject.id)) {
        subjectsMap.set(tc.subject.id, {
          id: tc.subject.id,
          name: tc.subject.name,
          slug: tc.subject.slug,
          teacherUserId: tc.teacher?.user?.id ?? '',
        })
      }
    }

    const subjects = Array.from(subjectsMap.values())

    // Get current user for filtering
    const user = auth.user
    if (user) {
      await user.load('role')
    }
    const userRole = user?.role?.name ?? ''

    return inertia.render(
      'escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/situacao',
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
        subjects,
        currentUserId: user?.id ?? null,
        currentUserRole: userRole,
      }
    )
  }
}
