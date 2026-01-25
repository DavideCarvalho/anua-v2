import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import GamificationEvent from '#models/gamification_event'
import StudentGamification from '#models/student_gamification'
import GamificationEventDto from '#models/dto/gamification_event.dto'

export default class UnlockAchievementController {
  async handle({ request, response }: HttpContext) {
    const { studentId, achievementId } = request.only(['studentId', 'achievementId'])

    if (!studentId || !achievementId) {
      return response.badRequest({ message: 'studentId e achievementId sao obrigatorios' })
    }

    const achievement = await Achievement.find(achievementId)

    if (!achievement) {
      return response.notFound({ message: 'Conquista nao encontrada' })
    }

    if (!achievement.isActive) {
      return response.badRequest({ message: 'Conquista nao esta ativa' })
    }

    // Check if student gamification exists
    const studentGamification = await StudentGamification.findBy('studentId', studentId)

    if (!studentGamification) {
      return response.notFound({ message: 'Perfil de gamificacao do aluno nao encontrado' })
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
        return response.conflict({ message: 'Conquista ja foi desbloqueada para este aluno' })
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
