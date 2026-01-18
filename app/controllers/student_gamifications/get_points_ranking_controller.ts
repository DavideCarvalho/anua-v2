import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import { getPointsRankingValidator } from '#validators/gamification'
import db from '@adonisjs/lucid/services/db'

export default class GetPointsRankingController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(getPointsRankingValidator)

    const limit = payload.limit || 10

    const query = StudentGamification.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('points', 'desc')
      .limit(limit)

    // Filter by school
    query.whereHas('student', (studentQuery) => {
      studentQuery.whereHas('user', (userQuery) => {
        userQuery.where('schoolId', payload.schoolId)
      })

      // Filter by class if provided
      if (payload.classId) {
        studentQuery.where('classId', payload.classId)
      }

      // Filter by level if provided (using classId -> classes.levelId)
      if (payload.levelId) {
        studentQuery.whereIn(
          'classId',
          db.from('classes').select('id').where('level_id', payload.levelId)
        )
      }
    })

    const rankings = await query

    const rankedStudents = rankings.map((gamification, index) => ({
      rank: index + 1,
      studentId: gamification.studentId,
      student: gamification.student,
      points: gamification.points,
      level: gamification.level,
      streakDays: gamification.streakDays,
    }))

    return response.ok({
      filters: {
        schoolId: payload.schoolId,
        classId: payload.classId ?? null,
        levelId: payload.levelId ?? null,
        limit,
      },
      ranking: rankedStudents,
    })
  }
}
