import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreInstallmentRule from '#models/store_installment_rule'
import { createStoreInstallmentRuleValidator } from '#validators/store'
import StoreInstallmentRuleTransformer from '#transformers/store_installment_rule_transformer'

export default class CreateStoreInstallmentRuleController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createStoreInstallmentRuleValidator)

    await Store.query().where('id', data.storeId).whereNull('deletedAt').firstOrFail()

    const rule = await StoreInstallmentRule.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(await serialize(StoreInstallmentRuleTransformer.transform(rule)))
  }
}
