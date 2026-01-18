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
      .preload('events', (eventsQuery) => {
        eventsQuery.preload('achievement')
      })
      .first()

    if (!gamification) {
      return response.notFound({ message: 'Student gamification profile not found' })
    }

    // Get all point transactions for this student
    const transactions = await GamificationEvent.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .limit(50)

    // Get achievements unlocked
    const achievements = await GamificationEvent.query()
      .where('studentId', studentId)
      .where('eventType', 'ACHIEVEMENT_UNLOCKED')
      .preload('achievement')

    // Calculate stats
    const totalPointsEarned = transactions
      .filter((t) => t.pointsChange > 0)
      .reduce((sum, t) => sum + t.pointsChange, 0)

    const totalPointsSpent = transactions
      .filter((t) => t.pointsChange < 0)
      .reduce((sum, t) => sum + Math.abs(t.pointsChange), 0)

    // Count level ups by checking metadata for leveledUp flag
    const levelUps = transactions.filter((t) => {
      const metadata = t.metadata as Record<string, unknown> | null
      return metadata?.previousLevel !== undefined && metadata?.newLevel !== undefined &&
             Number(metadata.newLevel) > Number(metadata.previousLevel)
    }).length

    return response.ok({
      gamification: {
        id: gamification.id,
        studentId: gamification.studentId,
        points: gamification.points,
        level: gamification.level,
        experience: gamification.experience,
        streakDays: gamification.streakDays,
        lastActivityDate: gamification.lastActivityDate,
        totalAssignmentsCompleted: gamification.totalAssignmentsCompleted,
        totalExamsTaken: gamification.totalExamsTaken,
        averageGrade: gamification.averageGrade,
        attendancePercentage: gamification.attendancePercentage,
      },
      student: gamification.student,
      stats: {
        totalPointsEarned,
        totalPointsSpent,
        netPoints: totalPointsEarned - totalPointsSpent,
        levelUps,
        achievementsUnlocked: achievements.length,
      },
      achievements: achievements.map((a) => ({
        id: a.id,
        achievement: a.achievement,
        unlockedAt: a.createdAt,
      })),
      recentTransactions: transactions.slice(0, 20).map((t) => ({
        id: t.id,
        eventType: t.eventType,
        pointsChange: t.pointsChange,
        description: t.description,
        metadata: t.metadata,
        createdAt: t.createdAt,
      })),
    })
  }
}
