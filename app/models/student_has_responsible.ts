import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Student from './student.js'

export default class StudentHasResponsible extends BaseModel {
  static table = 'StudentHasResponsible'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'responsibleId' })
  declare responsibleId: string

  @column({ columnName: 'isPedagogical' })
  declare isPedagogical: boolean

  @column({ columnName: 'isFinancial' })
  declare isFinancial: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
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
