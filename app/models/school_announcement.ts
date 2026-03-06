import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import User from './user.js'
import SchoolAnnouncementRecipient from './school_announcement_recipient.js'
import SchoolAnnouncementAudience from './school_announcement_audience.js'

export type SchoolAnnouncementStatus = 'DRAFT' | 'PUBLISHED'

export default class SchoolAnnouncement extends BaseModel {
  static table = 'SchoolAnnouncement'

  @beforeCreate()
  static assignId(model: SchoolAnnouncement) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'title' })
  declare title: string

  @column({ columnName: 'body' })
  declare body: string

  @column({ columnName: 'status' })
  declare status: SchoolAnnouncementStatus

  @column({ columnName: 'requiresAcknowledgement' })
  declare requiresAcknowledgement: boolean

  @column.dateTime({ columnName: 'acknowledgementDueAt' })
  declare acknowledgementDueAt: DateTime | null

  @column.dateTime({ columnName: 'publishedAt' })
  declare publishedAt: DateTime | null

  @column({ columnName: 'createdByUserId' })
  declare createdByUserId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => SchoolAnnouncementRecipient, { foreignKey: 'announcementId' })
  declare recipients: HasMany<typeof SchoolAnnouncementRecipient>

  @hasMany(() => SchoolAnnouncementAudience, { foreignKey: 'announcementId' })
  declare audiences: HasMany<typeof SchoolAnnouncementAudience>
}
