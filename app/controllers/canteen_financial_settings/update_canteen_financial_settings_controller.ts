import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import CanteenFinancialSettingsTransformer from '#transformers/canteen_financial_settings_transformer'
import { upsertCanteenFinancialSettingsValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class UpdateCanteenFinancialSettingsController {
  async handle({ params, request, response, serialize, selectedSchoolIds }: HttpContext) {
    const { canteenId } = params
    const payload = await request.validateUsing(upsertCanteenFinancialSettingsValidator)

    const canteen = await Canteen.query()
      .where('id', canteenId)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    const existing = await CanteenFinancialSettings.query().where('canteenId', canteenId).first()

    if (!existing) {
      const created = await CanteenFinancialSettings.create({
        canteenId,
        platformFeePercentage: payload.platformFeePercentage ?? 0,
        pixKey: payload.pixKey ?? null,
        pixKeyType: payload.pixKeyType ?? null,
        bankName: payload.bankName ?? null,
        accountHolder: payload.accountHolder ?? null,
      })

      return response.ok(await serialize(CanteenFinancialSettingsTransformer.transform(created)))
    }

    if (payload.platformFeePercentage !== undefined) {
      existing.platformFeePercentage = payload.platformFeePercentage
    }
    if (payload.pixKey !== undefined) {
      existing.pixKey = payload.pixKey
    }
    if (payload.pixKeyType !== undefined) {
      existing.pixKeyType = payload.pixKeyType
    }
    if (payload.bankName !== undefined) {
      existing.bankName = payload.bankName
    }
    if (payload.accountHolder !== undefined) {
      existing.accountHolder = payload.accountHolder
    }

    await existing.save()

    return response.ok(await serialize(CanteenFinancialSettingsTransformer.transform(existing)))
  }
}
