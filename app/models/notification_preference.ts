import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { NotificationType, NotificationChannel } from './notification.js'

export default class NotificationPreference extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: NotificationType

  @column()
  declare channel: NotificationChannel

  @column()
  declare enabled: boolean

  @column()
  declare userId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
