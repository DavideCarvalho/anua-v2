import type { HttpContext } from '@adonisjs/core/http'
import WalletTopUp from '#models/wallet_top_up'
import WalletTopUpDto from '#models/dto/wallet_top_up.dto'

export default class ShowWalletTopUpController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const topUp = await WalletTopUp.find(params.id)
    if (!topUp) {
      return response.notFound({ message: 'Recarga não encontrada' })
    }

    if (topUp.responsibleUserId !== effectiveUser.id) {
      return response.forbidden({ message: 'Você não tem permissão para ver esta recarga' })
    }

    return new WalletTopUpDto(topUp)
  }
}
