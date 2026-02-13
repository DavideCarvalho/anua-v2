import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'
import AppException from '#exceptions/app_exception'

export default class DeleteSubscriptionPlanController {
  async handle({ params }: HttpContext) {
    const plan = await SubscriptionPlan.find(params.id)

    if (!plan) {
      throw AppException.notFound('Plano de assinatura não encontrado')
    }

    plan.isActive = false
    await plan.save()

    return plan
  }
}
