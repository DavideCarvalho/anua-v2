import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SchoolAnnouncement from './school_announcement.js'

export default class SchoolAnnouncementAttachment extends BaseModel {
  static table = 'SchoolAnnouncementAttachment'

  @beforeCreate()
  static assignId(model: SchoolAnnouncementAttachment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'announcementId' })
  declare announcementId: string

  @column({ columnName: 'fileName' })
  declare fileName: string

  @column({ columnName: 'filePath' })
  declare filePath: string

  @attachment<SchoolAnnouncementAttachment>({
    folder: (record) => `school-announcements/${record.announcementId}`,
    preComputeUrl: true,
  })
  declare file: Attachment | null

  @column({ columnName: 'mimeType' })
  declare mimeType: string

  @column({ columnName: 'fileSizeBytes' })
  declare fileSizeBytes: number

  @column({ columnName: 'position' })
  declare position: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => SchoolAnnouncement, { foreignKey: 'announcementId' })
  declare announcement: BelongsTo<typeof SchoolAnnouncement>
}
