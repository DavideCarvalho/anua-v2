import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

interface GamificationRow {
  id: string
  totalPoints: number
  currentLevel: number
  levelProgress: number
  streak: number
  longestStreak: number
  lastActivityAt: string | null
}

interface AchievementRow {
  id: string
  name: string
  description: string
  icon: string | null
  points: number
  category: string
  rarity: string
  unlockedAt: string
  progress: number
}

interface PointTransactionRow {
  id: string
  points: number
  balanceAfter: number
  type: string
  reason: string | null
  createdAt: string
}

export default class GetStudentGamificationController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver a gamificacao deste aluno',
      })
    }

    // Get student's gamification stats
    const gamificationResult = await db.rawQuery(
      `
      SELECT
        sg.id,
        sg."totalPoints",
        sg."currentLevel",
        sg."levelProgress",
        sg.streak,
        sg."longestStreak",
        sg."lastActivityAt"
      FROM "StudentGamification" sg
      WHERE sg."studentId" = :studentId
      `,
      { studentId }
    )

    const gamification = gamificationResult.rows[0] as GamificationRow | undefined

    // Get student's achievements
    const achievementsResult = await db.rawQuery(
      `
      SELECT
        a.id,
        a.name,
        a.description,
        a.icon,
        a.points,
        a.category,
        a.rarity,
        sa."unlockedAt",
        sa.progress
      FROM "StudentAchievement" sa
      JOIN "Achievement" a ON sa."achievementId" = a.id
      JOIN "StudentGamification" sg ON sa."studentGamificationId" = sg.id
      WHERE sg."studentId" = :studentId
        AND a."deletedAt" IS NULL
      ORDER BY sa."unlockedAt" DESC
      `,
      { studentId }
    )

    const achievements = achievementsResult.rows as AchievementRow[]

    // Get recent point transactions
    const transactionsResult = await db.rawQuery(
      `
      SELECT
        pt.id,
        pt.points,
        pt."balanceAfter",
        pt.type,
        pt.reason,
        pt."createdAt"
      FROM "PointTransaction" pt
      JOIN "StudentGamification" sg ON pt."studentGamificationId" = sg.id
      WHERE sg."studentId" = :studentId
      ORDER BY pt."createdAt" DESC
      LIMIT 20
      `,
      { studentId }
    )

    const transactions = transactionsResult.rows as PointTransactionRow[]

    // Get student name
    const studentResult = await db.rawQuery(
      `
      SELECT u.name
      FROM "User" u
      WHERE u.id = :studentId
      `,
      { studentId }
    )

    const studentName = (studentResult.rows[0] as { name: string } | undefined)?.name || 'Aluno'

    return {
      student: {
        id: studentId,
        name: studentName,
      },
      gamification: gamification
        ? {
            totalPoints: gamification.totalPoints,
            currentLevel: gamification.currentLevel,
            levelProgress: gamification.levelProgress,
            streak: gamification.streak,
            longestStreak: gamification.longestStreak,
            lastActivityAt: gamification.lastActivityAt,
          }
        : {
            totalPoints: 0,
            currentLevel: 1,
            levelProgress: 0,
            streak: 0,
            longestStreak: 0,
            lastActivityAt: null,
          },
      achievements: achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        points: a.points,
        category: a.category,
        rarity: a.rarity,
        unlockedAt: a.unlockedAt,
        progress: a.progress,
      })),
      recentTransactions: transactions.map((t) => ({
        id: t.id,
        points: t.points,
        balanceAfter: t.balanceAfter,
        type: t.type,
        reason: t.reason,
        createdAt: t.createdAt,
      })),
    }
  }
}
