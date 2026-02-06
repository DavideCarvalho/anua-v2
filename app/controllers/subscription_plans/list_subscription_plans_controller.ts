import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'
import SubscriptionPlanDto from '#models/dto/subscription_plan.dto'
import { listSubscriptionPlansValidator } from '#validators/subscription'

export default class ListSubscriptionPlansController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listSubscriptionPlansValidator)

    const { tier, isActive, page = 1, limit = 20 } = payload

    const query = SubscriptionPlan.query().orderBy('createdAt', 'desc')

    if (tier) {
      query.where('tier', tier)
    }

    if (isActive !== undefined) {
      query.where('isActive', isActive)
    }

    const plans = await query.paginate(page, limit)

    return SubscriptionPlanDto.fromPaginator(plans)
  }
}
