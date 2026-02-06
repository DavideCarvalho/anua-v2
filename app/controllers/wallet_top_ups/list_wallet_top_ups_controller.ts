import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import WalletTopUp from '#models/wallet_top_up'
import WalletTopUpDto from '#models/dto/wallet_top_up.dto'
import { listWalletTopUpsValidator } from '#validators/wallet_top_up'

export default class ListWalletTopUpsController {
  async handle({ params, request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const { studentId } = params
    const { page = 1, limit = 20 } = await request.validateUsing(listWalletTopUpsValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Você não tem permissão para ver as recargas deste aluno',
      })
    }

    const topUps = await WalletTopUp.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return { data: topUps.all().map((t) => new WalletTopUpDto(t)), meta: topUps.getMeta() }
  }
}
