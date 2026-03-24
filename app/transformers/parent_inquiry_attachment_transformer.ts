import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiryAttachment from '#models/parent_inquiry_attachment'

export default class ParentInquiryAttachmentTransformer extends BaseTransformer<ParentInquiryAttachment> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'messageId',
      'fileName',
      'filePath',
      'fileSize',
      'mimeType',
      'createdAt',
    ])
  }
}
