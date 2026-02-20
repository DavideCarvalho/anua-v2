import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { updateContractValidator } from '#validators/contract'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'
import ContractEarlyDiscount from '#models/contract_early_discount'
import AppException from '#exceptions/app_exception'

export default class UpdateContractController {
  async handle({ params, request }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateContractValidator)

    const contract = await Contract.find(id)

    if (!contract) {
      throw AppException.contractNotFound()
    }

    const { endDate, amount, paymentDays, earlyDiscounts, ...rest } = payload
    const trx = await db.transaction()

    try {
      contract.useTransaction(trx)
      contract.merge({
        ...rest,
        ...(amount !== undefined && { ammount: amount }), // typo no banco: ammount ao invés de amount
        ...(endDate !== undefined && { endDate: endDate ? DateTime.fromJSDate(endDate) : null }),
      })
      await contract.save()

      if (paymentDays !== undefined) {
        const existingDays = await ContractPaymentDay.query({ client: trx }).where('contractId', id)
        const existingDayNumbers = existingDays.map((d) => d.day)
        const daysToAdd = paymentDays.filter((day) => !existingDayNumbers.includes(day))
        const daysToRemove = existingDays.filter((d) => !paymentDays.includes(d.day))

        for (const dayToRemove of daysToRemove) {
          dayToRemove.useTransaction(trx)
          await dayToRemove.delete()
        }

        for (const day of daysToAdd) {
          await ContractPaymentDay.create({ contractId: id, day }, { client: trx })
        }
      }

      if (earlyDiscounts !== undefined) {
        await ContractEarlyDiscount.query({ client: trx }).where('contractId', id).delete()
        if (earlyDiscounts.length > 0) {
          await Promise.all(
            earlyDiscounts.map((discount) =>
              ContractEarlyDiscount.create(
                {
                  contractId: id,
                  percentage: discount.percentage,
                  daysBeforeDeadline: discount.daysBeforeDeadline,
                },
                { client: trx }
              )
            )
          )
        }
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    await contract.load('paymentDays')
    await contract.load('earlyDiscounts')

    return contract
  }
}
