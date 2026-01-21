import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import GamificationEvent from '#models/gamification_event'

export default class GetStudentStatsController {
  async handle({ params, response }: HttpContext) {
    const { studentId } = params

    const gamification = await StudentGamification.query()
      .where('studentId', studentId)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .first()

    if (!gamification) {
      return response.notFound({ message: 'Student gamification profile not found' })
    }

    // Get all events for this student
    const events = await GamificationEvent.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .limit(50)

    // Get achievements unlocked
    const achievementEvents = await GamificationEvent.query()
      .where('studentId', studentId)
      .where('type', 'ACHIEVEMENT_UNLOCKED')

    // Count level ups by checking metadata for leveledUp flag
    const levelUps = events.filter((t) => {
      const metadata = t.metadata as Record<string, unknown> | null
      return metadata?.previousLevel !== undefined && metadata?.newLevel !== undefined &&
             Number(metadata.newLevel) > Number(metadata.previousLevel)
    }).length

    return response.ok({
      gamification: {
        id: gamification.id,
        studentId: gamification.studentId,
        totalPoints: gamification.totalPoints,
        currentLevel: gamification.currentLevel,
      },
      student: gamification.student,
      stats: {
        totalPoints: gamification.totalPoints,
        levelUps,
        achievementsUnlocked: achievementEvents.length,
      },
      achievements: achievementEvents.map((a) => ({
        id: a.id,
        entityType: a.entityType,
        entityId: a.entityId,
        unlockedAt: a.createdAt,
      })),
      recentEvents: events.slice(0, 20).map((t) => ({
        id: t.id,
        type: t.type,
        entityType: t.entityType,
        entityId: t.entityId,
        metadata: t.metadata,
        createdAt: t.createdAt,
      })),
    })
  }
}
