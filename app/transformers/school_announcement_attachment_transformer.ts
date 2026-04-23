import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolAnnouncementAttachment from '#models/school_announcement_attachment'

export default class SchoolAnnouncementAttachmentTransformer extends BaseTransformer<SchoolAnnouncementAttachment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'announcementId',
        'fileName',
        'filePath',
        'mimeType',
        'fileSizeBytes',
        'position',
        'createdAt',
        'updatedAt',
      ]),
      file: this.resource.file ?? null,
      fileUrl: this.resource.file?.url ?? null,
    }
  }
}
