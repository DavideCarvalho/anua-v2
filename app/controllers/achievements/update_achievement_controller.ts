import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import type { AchievementCategory } from '#models/achievement'
import { updateAchievementValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'
import AchievementTransformer from '#transformers/achievement_transformer'

// Map validator category to model category
const categoryMap: Record<string, AchievementCategory> = {
  ACADEMIC: 'ACADEMIC',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class UpdateAchievementController {
  async handle({ params, request, effectiveUser, selectedSchoolIds, serialize }: HttpContext) {
    const achievement = await Achievement.find(params.id)

    if (!achievement) {
      throw AppException.notFound('Conquista não encontrada')
    }

    // Verificar ownership - conquistas globais só podem ser modificadas por admins
    if (!achievement.schoolId) {
      // Conquista global - carregar role e verificar se é admin
      if (!effectiveUser?.role) {
        await effectiveUser?.load('role')
      }
      if (
        !effectiveUser?.role?.name ||
        !['SUPER_ADMIN', 'ADMIN'].includes(effectiveUser.role.name)
      ) {
        throw AppException.forbidden(
          'Conquistas globais só podem ser modificadas por administradores'
        )
      }
    } else {
      // Conquista da escola - verificar se a escola está no array de escolas do usuário
      const userSchoolIds = selectedSchoolIds || []
      if (userSchoolIds.length > 0 && !userSchoolIds.includes(achievement.schoolId)) {
        throw AppException.forbidden(
          'Você não tem permissão para modificar conquistas de outras escolas'
        )
      }
    }

    const payload = await request.validateUsing(updateAchievementValidator)

    if (payload.name !== undefined) {
      achievement.name = payload.name
    }
    if (payload.description !== undefined) {
      achievement.description = payload.description
    }
    if (payload.icon !== undefined) {
      achievement.icon = payload.icon
    }
    if (payload.points !== undefined) {
      achievement.points = payload.points
    }
    if (payload.category !== undefined) {
      const category = categoryMap[payload.category] || (payload.category as AchievementCategory)
      achievement.category = category
    }
    if (payload.criteria !== undefined) {
      achievement.criteria = payload.criteria
    }
    if (payload.isActive !== undefined) {
      achievement.isActive = payload.isActive
    }

    await achievement.save()

    return serialize(AchievementTransformer.transform(achievement))
  }
}
