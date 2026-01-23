import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'

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

    // Get all classes for this academic period
    const classesInPeriod = await ClassHasAcademicPeriod.query()
      .where('academicPeriodId', params.id)
      .preload('class', (classQuery) => {
        classQuery.preload('teacherClasses', (teacherClassQuery) => {
          teacherClassQuery.preload('teacher', (teacherQuery) => {
            teacherQuery.preload('user')
          })
          teacherClassQuery.preload('subject')
        })
      })

    // Create a map of levelId -> classes
    const classesMap = new Map<string, typeof classesInPeriod>()
    for (const cap of classesInPeriod) {
      const levelId = cap.class.levelId
      if (levelId) {
        if (!classesMap.has(levelId)) {
          classesMap.set(levelId, [])
        }
        classesMap.get(levelId)!.push(cap)
      }
    }

    const courses = academicPeriod.courseAcademicPeriods.map((cap) => ({
      id: cap.id,
      courseId: cap.courseId,
      name: cap.course.name,
      levels: cap.levelAssignments
        .map((la) => {
          const levelClasses = classesMap.get(la.levelId) || []
          return {
            id: la.id,
            levelId: la.levelId,
            name: la.level.name,
            order: la.level.order,
            contractId: la.level.contractId,
            isActive: la.isActive,
            classes: levelClasses.map((chap) => ({
              id: chap.class.id,
              name: chap.class.name,
              teachers: chap.class.teacherClasses.map((tc) => ({
                id: tc.id,
                teacherId: tc.teacherId,
                teacherName: tc.teacher?.user?.name || '',
                subjectId: tc.subjectId,
                subjectName: tc.subject?.name || '',
                subjectQuantity: tc.subjectQuantity,
              })),
            })),
          }
        })
        .sort((a, b) => a.order - b.order),
    }))

    return response.ok(courses)
  }
}
