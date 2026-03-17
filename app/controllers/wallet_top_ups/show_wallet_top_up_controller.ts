import type { HttpContext } from '@adonisjs/core/http'
import WalletTopUp from '#models/wallet_top_up'
import AppException from '#exceptions/app_exception'
import WalletTopUpTransformer from '#transformers/wallet_top_up_transformer'

export default class ShowWalletTopUpController {
  async handle({ params, effectiveUser, serialize }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const topUp = await WalletTopUp.query()
      .where('id', params.id)
      .preload('student')
      .preload('responsible')
      .first()
    if (!topUp) {
      throw AppException.notFound('Recarga não encontrada')
    }

    if (topUp.responsibleUserId !== effectiveUser.id) {
      throw AppException.forbidden('Você não tem permissão para ver esta recarga')
    }

    return serialize(WalletTopUpTransformer.transform(topUp))
  }
}
