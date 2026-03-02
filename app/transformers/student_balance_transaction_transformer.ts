import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentTransformer from '#transformers/student_transformer'

export default class StudentBalanceTransactionTransformer extends BaseTransformer<StudentBalanceTransaction> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'amount',
        'type',
        'status',
        'description',
        'previousBalance',
        'newBalance',
        'canteenPurchaseId',
        'storeOrderId',
        'responsibleId',
        'paymentGatewayId',
        'paymentMethod',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
    }
  }
}
