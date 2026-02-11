import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'

export default class PlatformSettings extends BaseModel {
  static table = 'PlatformSettings'

  @beforeCreate()
  static assignId(model: PlatformSettings) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare defaultTrialDays: number

  @column()
  declare defaultPricePerStudent: number

  @column()
  declare defaultStorePlatformFeePercentage: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
