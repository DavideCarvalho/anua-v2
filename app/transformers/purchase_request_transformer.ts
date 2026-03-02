import { BaseTransformer } from '@adonisjs/core/transformers'
import type PurchaseRequest from '#models/purchase_request'
import SchoolTransformer from '#transformers/school_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class PurchaseRequestTransformer extends BaseTransformer<PurchaseRequest> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'requestingUserId',
        'productName',
        'quantity',
        'finalQuantity',
        'status',
        'proposal',
        'dueDate',
        'value',
        'unitValue',
        'finalUnitValue',
        'finalValue',
        'description',
        'productUrl',
        'purchaseDate',
        'estimatedArrivalDate',
        'arrivalDate',
        'rejectionReason',
        'receiptPath',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      requestingUser: UserTransformer.transform(this.whenLoaded(this.resource.requestingUser)),
    }
  }
}
