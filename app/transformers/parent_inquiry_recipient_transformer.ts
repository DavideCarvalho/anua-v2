import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import UserTransformer from '#transformers/user_transformer'

export default class ParentInquiryRecipientTransformer extends BaseTransformer<ParentInquiryRecipient> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'inquiryId', 'userId', 'userType', 'createdAt']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.depth(6),
    }
  }
}
