import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Teacher from './teacher.js'
import Class_ from './class.js'

export default class TeacherHasClass extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare teacherId: string

  @column()
  declare classId: string

  @column()
  declare isMainTeacher: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Teacher)
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Class_)
  declare class: BelongsTo<typeof Class_>
}
