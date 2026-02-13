import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Subscription from '#models/subscription'
import SubscriptionDto from '#models/dto/subscription.dto'
import { updateSubscriptionValidator } from '#validators/subscription'
import AppException from '#exceptions/app_exception'

export default class UpdateSubscriptionController {
  async handle({ params, request, response }: HttpContext) {
    const subscription = await Subscription.find(params.id)

    if (!subscription) {
      throw AppException.notFound('Assinatura não encontrada')
    }

    const data = await request.validateUsing(updateSubscriptionValidator)

    const updatedSubscription = await db.transaction(async (trx) => {
      subscription.merge({
        planId: data.planId !== undefined ? data.planId : subscription.planId,
        billingCycle: data.billingCycle ?? subscription.billingCycle,
        pricePerStudent:
          data.pricePerStudent !== undefined ? data.pricePerStudent : subscription.pricePerStudent,
        discount: data.discount !== undefined ? data.discount : subscription.discount,
        paymentMethod:
          data.paymentMethod !== undefined ? data.paymentMethod : subscription.paymentMethod,
        creditCardToken:
          data.creditCardToken !== undefined ? data.creditCardToken : subscription.creditCardToken,
        creditCardHolderName:
          data.creditCardHolderName !== undefined
            ? data.creditCardHolderName
            : subscription.creditCardHolderName,
      })

      await subscription.useTransaction(trx).save()
      return subscription
    })

    await updatedSubscription.load('school')
    await updatedSubscription.load('schoolChain')
    await updatedSubscription.load('plan')

    return response.ok(new SubscriptionDto(updatedSubscription))
  }
}
