import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import GamificationEvent from '#models/gamification_event'
import { addPointsValidator } from '#validators/gamification'
import { DateTime } from 'luxon'

function calculateLevel(totalPoints: number): { level: number; progress: number } {
  // Each level requires levelNumber * 100 points
  let level = 1
  let pointsNeeded = 100
  let remainingPoints = totalPoints

  while (remainingPoints >= pointsNeeded) {
    remainingPoints -= pointsNeeded
    level++
    pointsNeeded = level * 100
  }

  const progress = Math.floor((remainingPoints / pointsNeeded) * 100)
  return { level, progress }
}

export default class AddPointsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(addPointsValidator)

    const gamification = await StudentGamification.find(payload.studentGamificationId)
    if (!gamification) {
      return response.notFound({ message: 'Student gamification not found' })
    }

    // Calculate new total points
    const newTotalPoints = gamification.points + payload.points
    if (newTotalPoints < 0) {
      return response.badRequest({ message: 'Insufficient points for this operation' })
    }

    // Calculate new level and progress
    const { level: newLevel, progress: newProgress } = calculateLevel(newTotalPoints)

    // Check if level changed for event type
    const leveledUp = newLevel > gamification.level

    // Determine event type based on transaction type
    const eventType = payload.points >= 0 ? 'POINTS_MANUAL_ADD' : 'POINTS_MANUAL_REMOVE'

    // Create a GamificationEvent record (point transaction)
    await GamificationEvent.create({
      studentId: gamification.studentId,
      eventType: eventType,
      entityType: 'Manual',
      entityId: gamification.id,
      status: 'PROCESSED',
      retryCount: 0,
      pointsChange: payload.points,
      description: payload.reason,
      metadata: {
        type: payload.type,
        relatedEntityType: payload.relatedEntityType ?? null,
        relatedEntityId: payload.relatedEntityId ?? null,
        previousPoints: gamification.points,
        newPoints: newTotalPoints,
        previousLevel: gamification.level,
        newLevel: newLevel,
      },
    })

    // Update streak logic
    const today = DateTime.now().startOf('day')
    const lastActivity = gamification.lastActivityDate
      ? DateTime.fromJSDate(gamification.lastActivityDate.toJSDate()).startOf('day')
      : null

    let newStreakDays = gamification.streakDays

    if (lastActivity) {
      const daysDiff = today.diff(lastActivity, 'days').days

      if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreakDays += 1
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        newStreakDays = 1
      }
      // If daysDiff === 0, same day, keep streak unchanged
    } else {
      // First activity
      newStreakDays = 1
    }

    // Update the gamification record
    gamification.points = newTotalPoints
    gamification.level = newLevel
    gamification.experience = newProgress
    gamification.streakDays = newStreakDays
    gamification.lastActivityDate = today
    await gamification.save()

    await gamification.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })

    return response.ok({
      gamification,
      transaction: {
        points: payload.points,
        type: payload.type,
        reason: payload.reason,
        leveledUp,
        newLevel,
        levelProgress: newProgress,
      },
    })
  }
}
