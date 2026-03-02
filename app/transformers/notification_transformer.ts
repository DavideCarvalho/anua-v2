import { BaseTransformer } from '@adonisjs/core/transformers'
import type Notification from '#models/notification'
import UserTransformer from '#transformers/user_transformer'

export default class NotificationTransformer extends BaseTransformer<Notification> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'type',
        'title',
        'message',
        'data',
        'isRead',
        'readAt',
        'sentViaInApp',
        'sentViaEmail',
        'sentViaPush',
        'sentViaSms',
        'sentViaWhatsApp',
        'emailSentAt',
        'emailError',
        'actionUrl',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}
