import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'

export default class CalendarConfig extends BaseModel {
  static table = 'CalendarConfig'

  @beforeCreate()
  static assignId(model: CalendarConfig) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare classesConfig: Record<string, unknown> | null

  @column()
  declare classesClashConfig: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
