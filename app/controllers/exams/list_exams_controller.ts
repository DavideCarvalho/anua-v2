import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamDto from '#models/dto/exam.dto'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'

export default class ListExamsController {
  async handle({ request }: HttpContext) {
    const { classId, subjectId, teacherId, status, page = 1, limit = 20 } = request.qs()

    const query = Exam.query()
      .preload('class', (classQuery) => {
        classQuery.preload('level')
      })
      .preload('subject')
      .preload('teacher')
      .withCount('grades', (q) => q.as('gradesCount'))
      .orderBy('examDate', 'desc')

    if (classId) {
      query.where('classId', classId)
    }

    if (subjectId) {
      query.where('subjectId', subjectId)
    }

    if (teacherId) {
      query.where('teacherId', teacherId)
    }

    if (status) {
      query.where('status', status)
    }

    const exams = await query.paginate(page, limit)

    // Get courseIds for all exams
    const examData = exams.all()
    const courseIdMap = new Map<string, string>()

    // Batch fetch course info for all unique level+academicPeriod combinations
    const levelPeriodPairs = examData
      .filter((exam) => exam.class?.levelId && exam.academicPeriodId)
      .map((exam) => ({
        levelId: exam.class!.levelId!,
        academicPeriodId: exam.academicPeriodId,
        examId: exam.id,
      }))

    if (levelPeriodPairs.length > 0) {
      // Fetch all level assignments in one query
      const levelAssignments = await LevelAssignedToCourseHasAcademicPeriod.query()
        .whereIn(
          'levelId',
          levelPeriodPairs.map((p) => p.levelId)
        )
        .where('isActive', true)
        .preload('courseHasAcademicPeriod')

      // Build a map of levelId -> academicPeriodId -> courseId
      for (const assignment of levelAssignments) {
        const key = `${assignment.levelId}:${assignment.courseHasAcademicPeriod?.academicPeriodId}`
        if (assignment.courseHasAcademicPeriod?.courseId) {
          courseIdMap.set(key, assignment.courseHasAcademicPeriod.courseId)
        }
      }

      // Map courseIds to exams
      for (const pair of levelPeriodPairs) {
        const key = `${pair.levelId}:${pair.academicPeriodId}`
        const courseId = courseIdMap.get(key)
        if (courseId) {
          const exam = examData.find((e) => e.id === pair.examId)
          if (exam) {
            exam.$extras.courseId = courseId
          }
        }
      }
    }

    return ExamDto.fromPaginator(exams)
  }
}
