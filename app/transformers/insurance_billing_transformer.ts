import { BaseTransformer } from '@adonisjs/core/transformers'
import type InsuranceBilling from '#models/insurance_billing'
import SchoolTransformer from '#transformers/school_transformer'

export default class InsuranceBillingTransformer extends BaseTransformer<InsuranceBilling> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'period',
        'insuredStudentsCount',
        'averageTuition',
        'insurancePercentage',
        'totalAmount',
        'status',
        'dueDate',
        'paidAt',
        'invoiceUrl',
        'paymentGatewayId',
        'lastReminderSentAt',
        'notes',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
