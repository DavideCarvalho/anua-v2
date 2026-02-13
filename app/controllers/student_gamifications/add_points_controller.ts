import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import GamificationEvent from '#models/gamification_event'
import { addPointsValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

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
      throw AppException.notFound('Gamificação do aluno não encontrada')
    }

    // Calculate new total points
    const newTotalPoints = gamification.totalPoints + payload.points
    if (newTotalPoints < 0) {
      throw AppException.badRequest('Pontos insuficientes para esta operação')
    }

    // Calculate new level and progress
    const { level: newLevel, progress: newProgress } = calculateLevel(newTotalPoints)

    // Check if level changed for event type
    const leveledUp = newLevel > gamification.currentLevel

    // Determine event type based on transaction type
    const eventType = payload.points >= 0 ? 'POINTS_MANUAL_ADD' : 'POINTS_MANUAL_REMOVE'

    // Create a GamificationEvent record (point transaction)
    await GamificationEvent.create({
      studentId: gamification.studentId,
      type: eventType,
      entityType: 'Manual',
      entityId: gamification.id,
      processed: true,
      metadata: {
        type: payload.type,
        reason: payload.reason,
        relatedEntityType: payload.relatedEntityType ?? null,
        relatedEntityId: payload.relatedEntityId ?? null,
        previousPoints: gamification.totalPoints,
        newPoints: newTotalPoints,
        previousLevel: gamification.currentLevel,
        newLevel: newLevel,
      },
    })

    // Update the gamification record
    gamification.totalPoints = newTotalPoints
    gamification.currentLevel = newLevel
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
