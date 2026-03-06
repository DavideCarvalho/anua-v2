import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SchoolAnnouncement from './school_announcement.js'

export type SchoolAnnouncementAudienceScopeType = 'ACADEMIC_PERIOD' | 'COURSE' | 'LEVEL' | 'CLASS'

export default class SchoolAnnouncementAudience extends BaseModel {
  static table = 'SchoolAnnouncementAudience'

  @beforeCreate()
  static assignId(model: SchoolAnnouncementAudience) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'announcementId' })
  declare announcementId: string

  @column({ columnName: 'scopeType' })
  declare scopeType: SchoolAnnouncementAudienceScopeType

  @column({ columnName: 'scopeId' })
  declare scopeId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => SchoolAnnouncement, { foreignKey: 'announcementId' })
  declare announcement: BelongsTo<typeof SchoolAnnouncement>
}
