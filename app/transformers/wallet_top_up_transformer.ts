import { BaseTransformer } from '@adonisjs/core/transformers'
import type WalletTopUp from '#models/wallet_top_up'
import StudentTransformer from '#transformers/student_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class WalletTopUpTransformer extends BaseTransformer<WalletTopUp> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'responsibleUserId',
        'amount',
        'status',
        'paymentGateway',
        'paymentGatewayId',
        'paymentMethod',
        'paidAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      responsible: UserTransformer.transform(this.whenLoaded(this.resource.responsible)),
    }
  }
}
