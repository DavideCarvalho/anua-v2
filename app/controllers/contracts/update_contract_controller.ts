import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { updateContractValidator } from '#validators/contract'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'

export default class UpdateContractController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateContractValidator)

    const contract = await Contract.find(id)

    if (!contract) {
      return response.notFound({ message: 'Contract not found' })
    }

    const { endDate, amount, paymentDays, ...rest } = payload
    contract.merge({
      ...rest,
      ...(amount !== undefined && { ammount: amount }), // typo no banco: ammount ao invés de amount
      ...(endDate !== undefined && { endDate: endDate ? DateTime.fromJSDate(endDate) : null }),
    })
    await contract.save()

    // Sync payment days if provided
    if (paymentDays !== undefined) {
      const existingDays = await ContractPaymentDay.query().where('contractId', id)
      const existingDayNumbers = existingDays.map((d) => d.day)

      // Days to add (in new but not in existing)
      const daysToAdd = paymentDays.filter((day) => !existingDayNumbers.includes(day))

      // Days to remove (in existing but not in new)
      const daysToRemove = existingDays.filter((d) => !paymentDays.includes(d.day))

      // Remove old days
      for (const dayToRemove of daysToRemove) {
        await dayToRemove.delete()
      }

      // Add new days
      for (const day of daysToAdd) {
        await ContractPaymentDay.create({ contractId: id, day })
      }
    }

    // Reload with relations
    await contract.load('paymentDays')

    return contract
  }
}
