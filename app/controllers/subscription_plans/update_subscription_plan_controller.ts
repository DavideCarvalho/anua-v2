import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import SubscriptionPlan from '#models/subscription_plan'
import SubscriptionPlanDto from '#models/dto/subscription_plan.dto'
import { updateSubscriptionPlanValidator } from '#validators/subscription'
import AppException from '#exceptions/app_exception'

export default class UpdateSubscriptionPlanController {
  async handle({ params, request, response }: HttpContext) {
    const plan = await SubscriptionPlan.find(params.id)

    if (!plan) {
      throw AppException.notFound('Plano de assinatura não encontrado')
    }

    const data = await request.validateUsing(updateSubscriptionPlanValidator)

    const updatedPlan = await db.transaction(async (trx) => {
      plan.merge({
        name: data.name ?? plan.name,
        tier: data.tier ?? plan.tier,
        description: data.description !== undefined ? data.description : plan.description,
        monthlyPrice: data.monthlyPrice !== undefined ? data.monthlyPrice : plan.monthlyPrice,
        annualPrice: data.annualPrice !== undefined ? data.annualPrice : plan.annualPrice,
        maxStudents: data.maxStudents !== undefined ? data.maxStudents : plan.maxStudents,
        maxTeachers: data.maxTeachers !== undefined ? data.maxTeachers : plan.maxTeachers,
        maxSchoolsInChain:
          data.maxSchoolsInChain !== undefined ? data.maxSchoolsInChain : plan.maxSchoolsInChain,
        features: data.features !== undefined ? data.features : plan.features,
        isActive: data.isActive ?? plan.isActive,
      })
      await plan.useTransaction(trx).save()
      return plan
    })

    return response.ok(new SubscriptionPlanDto(updatedPlan))
  }
}
