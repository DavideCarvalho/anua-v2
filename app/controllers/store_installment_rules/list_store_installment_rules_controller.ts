import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import { listStoreInstallmentRulesValidator } from '#validators/store'

export default class ListStoreInstallmentRulesController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(listStoreInstallmentRulesValidator)

    const rules = await StoreInstallmentRule.query()
      .where('storeId', data.storeId)
      .orderBy('minAmount', 'asc')

    return response.ok(rules)
  }
}
