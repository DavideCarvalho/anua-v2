import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SchoolAnnouncement from './school_announcement.js'
import User from './user.js'
import Student from './student.js'
import Notification from './notification.js'

export default class SchoolAnnouncementRecipient extends BaseModel {
  static table = 'SchoolAnnouncementRecipient'

  @beforeCreate()
  static assignId(model: SchoolAnnouncementRecipient) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'announcementId' })
  declare announcementId: string

  @column({ columnName: 'responsibleId' })
  declare responsibleId: string

  @column({ columnName: 'studentId' })
  declare studentId: string | null

  @column({ columnName: 'notificationId' })
  declare notificationId: string | null

  @column.dateTime({ columnName: 'acknowledgedAt' })
  declare acknowledgedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => SchoolAnnouncement, { foreignKey: 'announcementId' })
  declare announcement: BelongsTo<typeof SchoolAnnouncement>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Notification, { foreignKey: 'notificationId' })
  declare notification: BelongsTo<typeof Notification>
}
