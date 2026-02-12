import type { HttpContext } from '@adonisjs/core/http'
import WalletTopUp from '#models/wallet_top_up'
import WalletTopUpDto from '#models/dto/wallet_top_up.dto'
import AppException from '#exceptions/app_exception'

export default class ShowWalletTopUpController {
  async handle({ params, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const topUp = await WalletTopUp.find(params.id)
    if (!topUp) {
      throw AppException.notFound('Recarga não encontrada')
    }

    if (topUp.responsibleUserId !== effectiveUser.id) {
      throw AppException.forbidden('Você não tem permissão para ver esta recarga')
    }

    return new WalletTopUpDto(topUp)
  }
}
