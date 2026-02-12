import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import GamificationEvent from '#models/gamification_event'
import StudentGamification from '#models/student_gamification'
import GamificationEventDto from '#models/dto/gamification_event.dto'
import AppException from '#exceptions/app_exception'

export default class UnlockAchievementController {
  async handle({ request }: HttpContext) {
    const { studentId, achievementId } = request.only(['studentId', 'achievementId'])

    if (!studentId || !achievementId) {
      throw AppException.badRequest('studentId e achievementId são obrigatórios')
    }

    const achievement = await Achievement.find(achievementId)

    if (!achievement) {
      throw AppException.notFound('Conquista não encontrada')
    }

    if (!achievement.isActive) {
      throw AppException.badRequest('Conquista não está ativa')
    }

    // Check if student gamification exists
    const studentGamification = await StudentGamification.findBy('studentId', studentId)

    if (!studentGamification) {
      throw AppException.notFound('Perfil de gamificação do aluno não encontrado')
    }

    // Check if achievement was already unlocked (based on recurrence period)
    const isOneTime = achievement.recurrencePeriod === 'ONCE'
    if (isOneTime) {
      const existingUnlock = await GamificationEvent.query()
        .where('studentId', studentId)
        .where('entityType', 'ACHIEVEMENT')
        .where('entityId', achievementId)
        .where('type', 'ACHIEVEMENT_UNLOCKED')
        .first()

      if (existingUnlock) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    // Create gamification event for unlocking the achievement
    const gamificationEvent = await GamificationEvent.create({
      studentId,
      type: 'ACHIEVEMENT_UNLOCKED',
      entityType: 'ACHIEVEMENT',
      entityId: achievement.id,
      metadata: {
        achievementName: achievement.name,
        achievementCategory: achievement.category,
        pointsAwarded: achievement.points,
      },
      processed: false,
    })

    // Update student points
    studentGamification.totalPoints += achievement.points
    await studentGamification.save()

    await gamificationEvent.load('student')

    return new GamificationEventDto(gamificationEvent)
  }
}
