import { BaseTransformer } from '@adonisjs/core/transformers'
import type Invoice from '#models/invoice'
import StudentTransformer from '#transformers/student_transformer'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'
import type StudentPayment from '#models/student_payment'

export default class InvoiceTransformer extends BaseTransformer<Invoice> {
  toObject() {
    const payments = this.resource.$preloaded.payments as StudentPayment[] | undefined
    const filteredPayments = payments?.filter(
      (payment) => !['CANCELLED', 'RENEGOTIATED'].includes(payment.status)
    )

    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'contractId',
        'type',
        'month',
        'year',
        'dueDate',
        'status',
        'baseAmount',
        'discountAmount',
        'fineAmount',
        'interestAmount',
        'platformFeeAmount',
        'chargedAmount',
        'totalAmount',
        'netAmountReceived',
        'paidAt',
        'paymentMethod',
        'paymentGatewayId',
        'paymentGateway',
        'invoiceUrl',
        'observation',
        'nfseStatus',
        'nfsePdfUrl',
        'nfseXmlUrl',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(6),
      payments: filteredPayments
        ? StudentPaymentTransformer.transform(filteredPayments)
        : undefined,
    }
  }
}
