import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'

export default class DeleteStoreInstallmentRuleController {
  async handle({ params, response }: HttpContext) {
    const rule = await StoreInstallmentRule.findOrFail(params.id)
    await rule.delete()

    return response.noContent()
  }
}
