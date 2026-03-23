import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import { updateStoreInstallmentRuleValidator } from '#validators/store'
import StoreInstallmentRuleTransformer from '#transformers/store_installment_rule_transformer'

export default class UpdateStoreInstallmentRuleController {
  async handle({ params, request, response, serialize }: HttpContext) {
    const rule = await StoreInstallmentRule.findOrFail(params.id)
    const data = await request.validateUsing(updateStoreInstallmentRuleValidator)

    rule.merge({
      minInstallmentAmount: data.minInstallmentAmount ?? rule.minInstallmentAmount,
      maxInstallments: data.maxInstallments ?? rule.maxInstallments,
      isActive: data.isActive ?? rule.isActive,
    })
    await rule.save()

    return response.ok(await serialize(StoreInstallmentRuleTransformer.transform(rule)))
  }
}
