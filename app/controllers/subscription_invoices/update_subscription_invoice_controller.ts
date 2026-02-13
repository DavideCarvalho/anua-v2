import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SubscriptionInvoice from '#models/subscription_invoice'
import { updateSubscriptionInvoiceValidator } from '#validators/subscription'
import AppException from '#exceptions/app_exception'

export default class UpdateSubscriptionInvoiceController {
  async handle({ params, request }: HttpContext) {
    const invoice = await SubscriptionInvoice.find(params.id)

    if (!invoice) {
      throw AppException.notFound('Fatura de assinatura não encontrada')
    }

    const data = await request.validateUsing(updateSubscriptionInvoiceValidator)

    if (data.paidAt) {
      invoice.paidAt = DateTime.fromJSDate(data.paidAt)
    }

    if (data.status) {
      invoice.status = data.status
    }

    if (data.invoiceUrl !== undefined) {
      invoice.invoiceUrl = data.invoiceUrl
    }

    if (data.paymentGatewayId !== undefined) {
      invoice.paymentGatewayId = data.paymentGatewayId
    }

    if (data.description !== undefined) {
      invoice.description = data.description
    }

    if (data.paymentMethodSnapshot !== undefined) {
      invoice.paymentMethodSnapshot = data.paymentMethodSnapshot
    }

    await invoice.save()
    await invoice.load('subscription')

    return invoice
  }
}
