import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SubscriptionInvoice from '#models/subscription_invoice'
import { createSubscriptionInvoiceValidator } from '#validators/subscription'

export default class CreateSubscriptionInvoiceController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(createSubscriptionInvoiceValidator)

    const invoice = await SubscriptionInvoice.create({
      ...data,
      dueDate: DateTime.fromJSDate(data.dueDate),
      status: 'PENDING',
      activeStudents: data.activeStudents ?? 0,
    })

    await invoice.load('subscription')

    return invoice
  }
}
