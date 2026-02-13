import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import AppException from '#exceptions/app_exception'

export default class GetChainSubscriptionController {
  async handle({ params }: HttpContext) {
    const { schoolChainId } = params

    const subscription = await Subscription.query()
      .where('schoolChainId', schoolChainId)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      throw AppException.notFound('Assinatura não encontrada para esta rede escolar')
    }

    return subscription
  }
}
