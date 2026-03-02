import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenPurchase from '#models/canteen_purchase'
import CanteenTransformer from '#transformers/canteen_transformer'
import UserTransformer from '#transformers/user_transformer'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'
import CanteenMonthlyTransferTransformer from '#transformers/canteen_monthly_transfer_transformer'

export default class CanteenPurchaseTransformer extends BaseTransformer<CanteenPurchase> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'canteenId',
        'totalAmount',
        'paymentMethod',
        'status',
        'paidAt',
        'studentPaymentId',
        'monthlyTransferId',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      canteen: CanteenTransformer.transform(this.whenLoaded(this.resource.canteen)),
      studentPayment: StudentPaymentTransformer.transform(
        this.whenLoaded(this.resource.studentPayment)
      ),
      monthlyTransfer: CanteenMonthlyTransferTransformer.transform(
        this.whenLoaded(this.resource.monthlyTransfer)
      ),
    }
  }
}
