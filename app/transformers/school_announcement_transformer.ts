import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolAnnouncement from '#models/school_announcement'
import UserTransformer from '#transformers/user_transformer'
import SchoolAnnouncementRecipientTransformer from '#transformers/school_announcement_recipient_transformer'
import SchoolAnnouncementAudienceTransformer from '#transformers/school_announcement_audience_transformer'
import SchoolAnnouncementAttachmentTransformer from '#transformers/school_announcement_attachment_transformer'

export default class SchoolAnnouncementTransformer extends BaseTransformer<SchoolAnnouncement> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'title',
        'body',
        'status',
        'publishedAt',
        'requiresAcknowledgement',
        'acknowledgementDueAt',
        'createdByUserId',
        'createdAt',
        'updatedAt',
      ]),
      creator: UserTransformer.transform(this.whenLoaded(this.resource.creator)),
      recipients: SchoolAnnouncementRecipientTransformer.transform(
        this.whenLoaded(this.resource.recipients)
      ),
      audiences: SchoolAnnouncementAudienceTransformer.transform(
        this.whenLoaded(this.resource.audiences)
      ),
      attachments: SchoolAnnouncementAttachmentTransformer.transform(
        this.whenLoaded(this.resource.attachments)
      ),
    }
  }
}
