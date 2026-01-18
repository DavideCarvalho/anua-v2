import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'
import { createSubscriptionPlanValidator } from '#validators/subscription'

export default class CreateSubscriptionPlanController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(createSubscriptionPlanValidator)

    const plan = await SubscriptionPlan.create(data)

    return plan
  }
}
