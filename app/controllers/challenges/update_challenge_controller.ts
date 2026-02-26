import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Challenge from '#models/challenge'
import { updateChallengeValidator } from '#validators/gamification'
import ChallengeDto from '#models/dto/challenge.dto'
import AppException from '#exceptions/app_exception'

export default class UpdateChallengeController {
  async handle({ request, params, effectiveUser, selectedSchoolIds }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)

    // Verificar ownership - desafios globais só podem ser modificados por admins
    if (!challenge.schoolId) {
      // Desafio global - carregar role e verificar se é admin
      if (!effectiveUser?.role) {
        await effectiveUser?.load('role')
      }
      if (
        !effectiveUser?.role?.name ||
        !['SUPER_ADMIN', 'ADMIN'].includes(effectiveUser.role.name)
      ) {
        throw AppException.forbidden(
          'Desafios globais só podem ser modificados por administradores'
        )
      }
    } else {
      // Desafio da escola - verificar se a escola está no array de escolas do usuário
      const userSchoolIds = selectedSchoolIds || []
      if (userSchoolIds.length > 0 && !userSchoolIds.includes(challenge.schoolId)) {
        throw AppException.forbidden(
          'Você não tem permissão para modificar desafios de outras escolas'
        )
      }
    }

    const payload = await request.validateUsing(updateChallengeValidator)

    if (payload.name !== undefined) challenge.name = payload.name
    if (payload.description !== undefined) challenge.description = payload.description
    if (payload.icon !== undefined) challenge.icon = payload.icon
    if (payload.points !== undefined) challenge.points = payload.points
    if (payload.category !== undefined) challenge.category = payload.category
    if (payload.criteria !== undefined) challenge.criteria = payload.criteria
    if (payload.isRecurring !== undefined) challenge.isRecurring = payload.isRecurring
    if (payload.recurrencePeriod !== undefined)
      challenge.recurrencePeriod = payload.recurrencePeriod
    if (payload.startDate !== undefined)
      challenge.startDate = payload.startDate ? DateTime.fromJSDate(payload.startDate) : null
    if (payload.endDate !== undefined)
      challenge.endDate = payload.endDate ? DateTime.fromJSDate(payload.endDate) : null
    if (payload.isActive !== undefined) challenge.isActive = payload.isActive

    await challenge.save()

    return new ChallengeDto(challenge)
  }
}
