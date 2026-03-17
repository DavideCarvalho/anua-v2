import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionPlan from '#models/subscription_plan'
import { listSubscriptionPlansValidator } from '#validators/subscription'
import SubscriptionPlanTransformer from '#transformers/subscription_plan_transformer'

export default class ListSubscriptionPlansController {
  async handle({ request, serialize }: HttpContext) {
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

    const items = plans.all()
    const metadata = plans.getMeta()
    return serialize(SubscriptionPlanTransformer.paginate(items, metadata))
  }
}
