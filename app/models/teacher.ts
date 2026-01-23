import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Subject from './subject.js'

export default class Teacher extends BaseModel {
  static table = 'Teacher'

  // Same ID as User (1:1 relationship)
  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'hourlyRate' })
  declare hourlyRate: number

  // Relationships
  @belongsTo(() => User, { foreignKey: 'id' })
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Subject, {
    pivotTable: 'TeacherHasSubject',
    localKey: 'id',
    pivotForeignKey: 'teacherId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'subjectId',
  })
  declare subjects: ManyToMany<typeof Subject>
}
