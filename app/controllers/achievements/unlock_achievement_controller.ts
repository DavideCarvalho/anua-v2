import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import GamificationEvent from '#models/gamification_event'
import StudentGamification from '#models/student_gamification'

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

    // Check if achievement was already unlocked (if not repeatable)
    if (!achievement.isRepeatable) {
      const existingUnlock = await GamificationEvent.query()
        .where('studentId', studentId)
        .where('achievementId', achievementId)
        .where('eventType', 'ACHIEVEMENT_UNLOCKED')
        .first()

      if (existingUnlock) {
        return response.conflict({ message: 'Conquista ja foi desbloqueada para este aluno' })
      }
    }

    // Create gamification event for unlocking the achievement
    const gamificationEvent = await GamificationEvent.create({
      studentId,
      eventType: 'ACHIEVEMENT_UNLOCKED',
      pointsChange: achievement.pointsReward,
      achievementId: achievement.id,
      description: `Conquista desbloqueada: ${achievement.name}`,
      metadata: {
        achievementName: achievement.name,
        achievementType: achievement.type,
      },
    })

    // Update student points
    studentGamification.points += achievement.pointsReward
    await studentGamification.save()

    await gamificationEvent.load('achievement')

    return response.created({
      message: 'Conquista desbloqueada com sucesso',
      event: gamificationEvent,
      pointsAwarded: achievement.pointsReward,
    })
  }
}
