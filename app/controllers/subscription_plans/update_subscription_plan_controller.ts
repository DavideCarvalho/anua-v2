import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'
import { updateSubscriptionPlanValidator } from '#validators/subscription'

export default class UpdateSubscriptionPlanController {
  async handle({ params, request, response }: HttpContext) {
    const plan = await SubscriptionPlan.find(params.id)

    if (!plan) {
      return response.notFound({ message: 'Subscription plan not found' })
    }

    const data = await request.validateUsing(updateSubscriptionPlanValidator)

    plan.merge(data)
    await plan.save()

    return plan
  }
}
