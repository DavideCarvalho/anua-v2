import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { createContractValidator } from '#validators/contract'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'
import ContractInterestConfig from '#models/contract_interest_config'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { ContractDto } from '#models/dto/contract.dto'

export default class CreateContractController {
  async handle({ request }: HttpContext) {
    const { amount, paymentDays, interestConfig, earlyDiscounts, ...payload } =
      await request.validateUsing(createContractValidator)

    const trx = await db.transaction()

    try {
      const contract = await Contract.create(
        {
          ...payload,
          ammount: amount, // typo no banco: ammount ao invés de amount
          endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : null,
        },
        { client: trx }
      )

      // Create payment days
      if (paymentDays && paymentDays.length > 0) {
        await Promise.all(
          paymentDays.map((day) =>
            ContractPaymentDay.create(
              {
                contractId: contract.id,
                day,
              },
              { client: trx }
            )
          )
        )
      }

      // Create interest config
      if (interestConfig) {
        await ContractInterestConfig.create(
          {
            contractId: contract.id,
            delayInterestPercentage: Number(interestConfig.delayInterestPercentage || 0),
            delayInterestPerDayDelayed: Number(interestConfig.delayInterestPerDayDelayed || 0),
          },
          { client: trx }
        )
      }

      // Create early discounts
      if (earlyDiscounts && earlyDiscounts.length > 0) {
        await Promise.all(
          earlyDiscounts.map((discount) =>
            ContractEarlyDiscount.create(
              {
                contractId: contract.id,
                percentage: discount.percentage,
                daysBeforeDeadline: discount.daysBeforeDeadline,
              },
              { client: trx }
            )
          )
        )
      }

      await trx.commit()

      // Load relationships to return complete contract
      await contract.load('paymentDays')
      await contract.load('interestConfig')
      await contract.load('earlyDiscounts')

      return new ContractDto(contract)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
