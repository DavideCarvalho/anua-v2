import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StoreInstallmentRule from '#models/store_installment_rule'
import { updateStoreInstallmentRuleValidator } from '#validators/store'
import AppException from '#exceptions/app_exception'
import StoreInstallmentRuleTransformer from '#transformers/store_installment_rule_transformer'

export default class UpdateStoreInstallmentRuleController {
  async handle({ params, request, response, selectedSchoolIds, serialize }: HttpContext) {
    const rule = await StoreInstallmentRule.query()
      .where('id', params.id)
      .whereHas('store', (storeQuery) => {
        storeQuery.whereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!rule) {
      throw AppException.notFound('Regra de parcelamento não encontrada')
    }
    const data = await request.validateUsing(updateStoreInstallmentRuleValidator)

    const updatedRule = await db.transaction(async (trx) => {
      rule.merge({
        minAmount: data.minAmount ?? rule.minAmount,
        maxInstallments: data.maxInstallments ?? rule.maxInstallments,
        isActive: data.isActive ?? rule.isActive,
      })
      await rule.useTransaction(trx).save()
      return rule
    })

    return response.ok(await serialize(StoreInstallmentRuleTransformer.transform(updatedRule)))
  }
}
