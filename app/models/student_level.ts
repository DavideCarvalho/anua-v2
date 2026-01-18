import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class StudentLevel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare currentLevel: number

  @column()
  declare currentXp: number

  @column()
  declare totalXp: number

  @column()
  declare xpToNextLevel: number

  @column.dateTime()
  declare lastLevelUp: DateTime | null

  @column()
  declare studentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
