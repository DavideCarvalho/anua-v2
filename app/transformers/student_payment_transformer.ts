import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentPayment from '#models/student_payment'
import StudentTransformer from './student_transformer.js'
import StudentHasExtraClassTransformer from '#transformers/student_has_extra_class_transformer'

function resolveDiscountSource(
  payment: StudentPayment
): 'INDIVIDUAL' | 'SCHOLARSHIP' | 'UNKNOWN' | null {
  const studentHasLevel = payment.studentHasLevel as
    | {
        individualDiscounts?: unknown[]
        scholarshipId?: string | null
      }
    | undefined

  const hasIndividualDiscount = (studentHasLevel?.individualDiscounts?.length ?? 0) > 0
  const hasScholarship = !!studentHasLevel?.scholarshipId

  if (hasIndividualDiscount) {
    return 'INDIVIDUAL'
  }

  if (hasScholarship) {
    return 'SCHOLARSHIP'
  }

  if (payment.discountPercentage > 0 || payment.discountValue > 0) {
    return 'UNKNOWN'
  }

  return null
}

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
      discountSource: resolveDiscountSource(this.resource),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(2),
      studentHasExtraClass: StudentHasExtraClassTransformer.transform(
        this.whenLoaded(this.resource.studentHasExtraClass)
      ),
    }
  }
}
