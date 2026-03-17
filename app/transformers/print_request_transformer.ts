import { BaseTransformer } from '@adonisjs/core/transformers'
import type PrintRequest from '#models/print_request'
import UserTransformer from '#transformers/user_transformer'

export default class PrintRequestTransformer extends BaseTransformer<PrintRequest> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'name',
        'path',
        'status',
        'frontAndBack',
        'rejectedFeedback',
        'quantity',
        'dueDate',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.depth(2),
    }
  }
}
