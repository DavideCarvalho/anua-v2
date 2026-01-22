import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Teacher from './teacher.js'
import Subject from './subject.js'

export default class TeacherHasSubject extends BaseModel {
  static table = 'TeacherHasSubject'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare teacherId: string

  @column()
  declare subjectId: string

  // Relationships
  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>
}
