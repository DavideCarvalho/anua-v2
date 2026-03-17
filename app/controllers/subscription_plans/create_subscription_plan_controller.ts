import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import SubscriptionPlan from '#models/subscription_plan'
import { createSubscriptionPlanValidator } from '#validators/subscription'
import SubscriptionPlanTransformer from '#transformers/subscription_plan_transformer'

export default class CreateSubscriptionPlanController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createSubscriptionPlanValidator)

    // Usa transaction para garantir atomicidade
    const plan = await db.transaction(async (trx) => {
      // Cria plano explicitando campos permitidos (evita mass assignment)
      const newPlan = await SubscriptionPlan.create(
        {
          name: data.name,
          tier: data.tier,
          description: data.description ?? null,
          monthlyPrice: data.monthlyPrice,
          annualPrice: data.annualPrice ?? null,
          maxStudents: data.maxStudents ?? null,
          maxTeachers: data.maxTeachers ?? null,
          maxSchoolsInChain: data.maxSchoolsInChain ?? null,
          features: data.features ?? null,
          isActive: data.isActive ?? true,
        },
        { client: trx }
      )

      return newPlan
    })

    return response.created(await serialize(SubscriptionPlanTransformer.transform(plan)))
  }
}
