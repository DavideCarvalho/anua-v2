import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Level from './level.js'
import School from './school.js'
import Student from './student.js'
import Teacher from './teacher.js'
import Exam from './exam.js'
import TeacherHasClass from './teacher_has_class.js'

export default class Class_ extends BaseModel {
  static table = 'Class'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare schoolId: string

  @column()
  declare levelId: string | null

  @column()
  declare isArchived: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Level, { foreignKey: 'levelId' })
  declare level: BelongsTo<typeof Level>

  @hasMany(() => Student, { foreignKey: 'classId' })
  declare students: HasMany<typeof Student>

  @hasMany(() => Exam, { foreignKey: 'classId' })
  declare exams: HasMany<typeof Exam>

  @hasMany(() => TeacherHasClass, { foreignKey: 'classId' })
  declare teacherClasses: HasMany<typeof TeacherHasClass>

  // Many-to-many with Teachers through TeacherHasClass
  @manyToMany(() => Teacher, {
    pivotTable: 'TeacherHasClass',
    localKey: 'id',
    pivotForeignKey: 'classId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'teacherId',
  })
  declare teachers: ManyToMany<typeof Teacher>
}
