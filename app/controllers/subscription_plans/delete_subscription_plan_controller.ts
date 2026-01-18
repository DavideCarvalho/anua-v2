import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'

export default class DeleteSubscriptionPlanController {
  async handle({ params, response }: HttpContext) {
    const plan = await SubscriptionPlan.find(params.id)

    if (!plan) {
      return response.notFound({ message: 'Subscription plan not found' })
    }

    plan.isActive = false
    await plan.save()

    return plan
  }
}
