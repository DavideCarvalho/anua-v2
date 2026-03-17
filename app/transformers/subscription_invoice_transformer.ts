import { BaseTransformer } from '@adonisjs/core/transformers'
import type SubscriptionInvoice from '#models/subscription_invoice'

export default class SubscriptionInvoiceTransformer extends BaseTransformer<SubscriptionInvoice> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'subscriptionId',
      'academicPeriodId',
      'month',
      'year',
      'activeStudents',
      'amount',
      'status',
      'dueDate',
      'paidAt',
      'invoiceUrl',
      'paymentGatewayId',
      'description',
      'paymentMethodSnapshot',
      'creditCardLastFourDigits',
      'creditCardBrand',
      'metadata',
      'chargeRetryCount',
      'nextChargeRetryAt',
      'lastChargeAttemptAt',
      'lastChargeError',
      'collectionStatus',
      'createdAt',
      'updatedAt',
    ])
  }
}
