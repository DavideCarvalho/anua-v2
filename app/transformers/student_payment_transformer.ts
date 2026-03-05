import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentPayment from '#models/student_payment'
import StudentTransformer from './student_transformer.js'

export default class StudentPaymentTransformer extends BaseTransformer<StudentPayment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'amount',
        'month',
        'year',
        'type',
        'status',
        'totalAmount',
        'dueDate',
        'installments',
        'installmentNumber',
        'discountPercentage',
        'discountType',
        'discountValue',
        'paidAt',
        'emailSentAt',
        'contractId',
        'classHasAcademicPeriodId',
        'studentHasLevelId',
        'invoiceUrl',
        'paymentGatewayId',
        'paymentGateway',
        'metadata',
        'agreementId',
        'invoiceId',
        'insuranceBillingId',
        'studentHasExtraClassId',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(2),
    }
  }
}
