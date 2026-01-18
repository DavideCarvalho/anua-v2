import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Student from './student.js'

export default class StudentHasResponsible extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare responsibleId: string

  @column()
  declare isPedagogical: boolean

  @column()
  declare isFinancial: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => Student, {
    foreignKey: 'studentId',
  })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, {
    foreignKey: 'responsibleId',
  })
  declare responsible: BelongsTo<typeof User>
}
