import { DateTime } from 'luxon'
import PointTransaction from '#models/point_transaction'
import StudentGamification from '#models/student_gamification'

export interface PointsCalculation {
  level: number
  progress: number
  streak: number
  longestStreak: number
}

export class PointsService {
  private readonly POINTS_PER_LEVEL = 1000

  calculateLevel(totalPoints: number): { level: number; progress: number } {
    const level = Math.floor(totalPoints / this.POINTS_PER_LEVEL) + 1
    const progress = totalPoints % this.POINTS_PER_LEVEL
    return { level, progress }
  }

  calculateStreak(
    currentStreak: number,
    lastActivityAt: Date | null
  ): { newStreak: number; shouldUpdate: boolean } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (!lastActivityAt) {
      return { newStreak: 1, shouldUpdate: true }
    }

    const lastActivity = new Date(lastActivityAt)
    const lastActivityDate = new Date(
      lastActivity.getFullYear(),
      lastActivity.getMonth(),
      lastActivity.getDate()
    )

    if (lastActivityDate.getTime() === yesterday.getTime()) {
      return { newStreak: currentStreak + 1, shouldUpdate: true }
    } else if (lastActivityDate.getTime() === today.getTime()) {
      return { newStreak: currentStreak, shouldUpdate: false }
    } else {
      return { newStreak: 1, shouldUpdate: true }
    }
  }

  async addPoints(params: {
    studentGamificationId: string
    points: number
    type: 'EARN' | 'SPEND' | 'ADJUSTMENT' | 'EXPIRY'
    reason: string
    relatedEntityType?: string
    relatedEntityId?: string
  }): Promise<{ transaction: PointTransaction; gamification: StudentGamification }> {
    // Get current gamification
    let gamification = await StudentGamification.findOrFail(params.studentGamificationId)

    // Calculate new values
    const newTotalPoints = gamification.totalPoints + params.points

    if (newTotalPoints < 0 && params.type === 'SPEND') {
      throw new Error('Insufficient points')
    }

    const { level: newLevel, progress: newProgress } = this.calculateLevel(newTotalPoints)
    const { newStreak } = this.calculateStreak(
      gamification.streak,
      gamification.lastActivityAt?.toJSDate() || null
    )
    const newLongestStreak = Math.max(newStreak, gamification.longestStreak)

    // Create transaction
    const transaction = await PointTransaction.create({
      studentGamificationId: params.studentGamificationId,
      points: params.points,
      balanceAfter: newTotalPoints,
      type: params.type,
      reason: params.reason,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    })

    // Update gamification
    gamification = await gamification
      .merge({
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        levelProgress: newProgress,
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityAt: DateTime.now(),
      })
      .save()

    return { transaction, gamification }
  }

  async getOrCreateStudentGamification(studentId: string): Promise<StudentGamification> {
    let gamification = await StudentGamification.query().where('studentId', studentId).first()

    if (!gamification) {
      gamification = await StudentGamification.create({
        studentId,
        totalPoints: 0,
        currentLevel: 1,
        levelProgress: 0,
        streak: 0,
        longestStreak: 0,
      })
    }

    return gamification
  }
}

export const pointsService = new PointsService()
