import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import WalletTopUp from '#models/wallet_top_up'
import WalletTopUpTransformer from '#transformers/wallet_top_up_transformer'
import { listWalletTopUpsValidator } from '#validators/wallet_top_up'
import AppException from '#exceptions/app_exception'

export default class ListWalletTopUpsController {
  async handle({ params, request, effectiveUser, serialize }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const { page = 1, limit = 20 } = await request.validateUsing(listWalletTopUpsValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as recargas deste aluno')
    }

    const topUps = await WalletTopUp.query()
      .where('studentId', studentId)
      .preload('student')
      .preload('responsible')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return {
      data: await Promise.all(
        topUps.all().map((topUp) => serialize(WalletTopUpTransformer.transform(topUp)))
      ),
      meta: topUps.getMeta(),
    }
  }
}
