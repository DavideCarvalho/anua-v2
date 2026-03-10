import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreOrder from '#models/store_order'
import StudentTransformer from '#transformers/student_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import StoreTransformer from '#transformers/store_transformer'
import UserTransformer from '#transformers/user_transformer'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'
import StoreSettlementTransformer from '#transformers/store_settlement_transformer'
import StoreOrderItemTransformer from '#transformers/store_order_item_transformer'

export default class StoreOrderTransformer extends BaseTransformer<StoreOrder> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'orderNumber',
        'studentId',
        'schoolId',
        'storeId',
        'status',
        'totalPrice',
        'totalPoints',
        'totalMoney',
        'paidAt',
        'approvedAt',
        'preparingAt',
        'readyAt',
        'deliveredAt',
        'canceledAt',
        'estimatedReadyAt',
        'studentNotes',
        'internalNotes',
        'studentPaymentId',
        'cancellationReason',
        'approvedBy',
        'preparedBy',
        'deliveredBy',
        'paymentMode',
        'paymentMethod',
        'settlementId',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(5),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school))?.depth(5),
      store: StoreTransformer.transform(this.whenLoaded(this.resource.store))?.depth(5),
      approver: UserTransformer.transform(this.whenLoaded(this.resource.approver))?.depth(5),
      preparer: UserTransformer.transform(this.whenLoaded(this.resource.preparer))?.depth(5),
      deliverer: UserTransformer.transform(this.whenLoaded(this.resource.deliverer))?.depth(5),
      studentPayment: StudentPaymentTransformer.transform(
        this.whenLoaded(this.resource.studentPayment)
      )?.depth(5),
      settlement: StoreSettlementTransformer.transform(
        this.whenLoaded(this.resource.settlement)
      )?.depth(5),
      items: StoreOrderItemTransformer.transform(this.whenLoaded(this.resource.items))?.depth(5),
    }
  }
}
