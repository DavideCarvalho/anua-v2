import {
  BaseModel,
  beforeCreate,
  column,
  belongsTo,
  manyToMany,
  hasMany,
} from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Subject from './subject.js'
import TeacherHasClass from './teacher_has_class.js'

export default class Teacher extends BaseModel {
  static table = 'Teacher'

  @beforeCreate()
  static assignId(model: Teacher) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

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

  @hasMany(() => TeacherHasClass, { foreignKey: 'teacherId' })
  declare teacherClasses: HasMany<typeof TeacherHasClass>
}
