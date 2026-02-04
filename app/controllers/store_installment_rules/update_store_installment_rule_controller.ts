import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import { updateStoreInstallmentRuleValidator } from '#validators/store'

export default class UpdateStoreInstallmentRuleController {
  async handle({ params, request, response }: HttpContext) {
    const rule = await StoreInstallmentRule.findOrFail(params.id)
    const data = await request.validateUsing(updateStoreInstallmentRuleValidator)

    rule.merge(data)
    await rule.save()

    return response.ok(rule)
  }
}
