import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'

export default class ClassSchedule extends BaseModel {
  static table = 'ClassSchedule'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare classId: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>
}
