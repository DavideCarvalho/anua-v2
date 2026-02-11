import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { NotificationType } from './notification.js'

export default class NotificationPreference extends BaseModel {
  static table = 'NotificationPreference'

  @beforeCreate()
  static assignId(model: NotificationPreference) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare notificationType: NotificationType

  @column()
  declare enableInApp: boolean

  @column()
  declare enableEmail: boolean

  @column()
  declare enablePush: boolean

  @column()
  declare enableSms: boolean

  @column()
  declare enableWhatsApp: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
