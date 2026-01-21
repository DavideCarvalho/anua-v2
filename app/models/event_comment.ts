import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import User from './user.js'

export default class EventComment extends BaseModel {
  static table = 'EventComment'

  @beforeCreate()
  static assignId(model: EventComment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare userId: string

  @column()
  declare content: string

  @column()
  declare parentId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => EventComment, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof EventComment>

  @hasMany(() => EventComment, { foreignKey: 'parentId' })
  declare replies: HasMany<typeof EventComment>
}
