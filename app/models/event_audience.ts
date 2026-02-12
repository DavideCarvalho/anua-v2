import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'

export type EventAudienceScopeType = 'SCHOOL' | 'ACADEMIC_PERIOD' | 'LEVEL' | 'CLASS'

export default class EventAudience extends BaseModel {
  static table = 'EventAudience'

  @beforeCreate()
  static assignId(model: EventAudience) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'eventId' })
  declare eventId: string

  @column({ columnName: 'scopeType' })
  declare scopeType: EventAudienceScopeType

  @column({ columnName: 'scopeId' })
  declare scopeId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>
}
