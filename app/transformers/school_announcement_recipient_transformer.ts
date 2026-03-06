import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolAnnouncementRecipient from '#models/school_announcement_recipient'
import UserTransformer from '#transformers/user_transformer'
import StudentTransformer from '#transformers/student_transformer'
import NotificationTransformer from '#transformers/notification_transformer'

export default class SchoolAnnouncementRecipientTransformer extends BaseTransformer<SchoolAnnouncementRecipient> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'announcementId',
        'responsibleId',
        'studentId',
        'notificationId',
        'acknowledgedAt',
        'createdAt',
      ]),
      responsible: UserTransformer.transform(this.whenLoaded(this.resource.responsible)),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      notification: NotificationTransformer.transform(this.whenLoaded(this.resource.notification)),
    }
  }
}
