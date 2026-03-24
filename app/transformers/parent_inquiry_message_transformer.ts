import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryMessage from '#models/parent_inquiry_message'
import UserTransformer from '#transformers/user_transformer'
import ParentInquiryAttachmentTransformer from '#transformers/parent_inquiry_attachment_transformer'

export default class ParentInquiryMessageTransformer extends BaseTransformer<ParentInquiryMessage> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'inquiryId',
        'authorId',
        'authorType',
        'body',
        'createdAt',
        'updatedAt',
      ]),
      author: UserTransformer.transform(this.whenLoaded(this.resource.author))?.depth(6),
      attachments: ParentInquiryAttachmentTransformer.transform(
        this.whenLoaded(this.resource.attachments)
      ),
    }
  }
}
