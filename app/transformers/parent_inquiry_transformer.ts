import { BaseTransformer } from '@adonisjs/core/transformers'
import type ParentInquiry from '#models/parent_inquiry'
import UserTransformer from '#transformers/user_transformer'
import StudentTransformer from '#transformers/student_transformer'
import ParentInquiryMessageTransformer from '#transformers/parent_inquiry_message_transformer'
import ParentInquiryRecipientTransformer from '#transformers/parent_inquiry_recipient_transformer'

export default class ParentInquiryTransformer extends BaseTransformer<ParentInquiry> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'createdByResponsibleId',
        'schoolId',
        'subject',
        'status',
        'resolvedAt',
        'resolvedBy',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(6),
      createdByResponsible: UserTransformer.transform(
        this.whenLoaded(this.resource.createdByResponsible)
      )?.depth(6),
      resolvedByUser: UserTransformer.transform(
        this.whenLoaded(this.resource.resolvedByUser)
      )?.depth(6),
      messages: ParentInquiryMessageTransformer.transform(
        this.whenLoaded(this.resource.messages)
      )?.depth(6),
      recipients: ParentInquiryRecipientTransformer.transform(
        this.whenLoaded(this.resource.recipients)
      )?.depth(6),
      hasUnread: this.computeHasUnread(),
    }
  }

  private computeHasUnread(): boolean {
    const readStatuses = this.whenLoaded(this.resource.readStatuses).value
    if (!readStatuses || readStatuses.length === 0) {
      return true
    }

    const lastReadAt = readStatuses[0].lastReadAt
    const messages = this.whenLoaded(this.resource.messages).value
    if (!messages || messages.length === 0) {
      return false
    }

    const lastMessage = messages[messages.length - 1]
    return lastMessage.createdAt > lastReadAt
  }
}
