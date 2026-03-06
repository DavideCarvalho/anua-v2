import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolAnnouncementAudience from '#models/school_announcement_audience'

export default class SchoolAnnouncementAudienceTransformer extends BaseTransformer<SchoolAnnouncementAudience> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'announcementId', 'scopeType', 'scopeId', 'createdAt']),
    }
  }
}
