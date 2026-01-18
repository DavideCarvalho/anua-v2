import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Level from './level.js'
import Student from './student.js'
import Teacher from './teacher.js'
import Assignment from './assignment.js'
import Exam from './exam.js'

export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export default class Class_ extends BaseModel {
  static table = 'classes'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare maxStudents: number | null

  @column()
  declare status: ClassStatus

  @column()
  declare levelId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Level)
  declare level: BelongsTo<typeof Level>

  // Students are related through Student model's classId
  @hasMany(() => Student, { foreignKey: 'classId' })
  declare students: HasMany<typeof Student>

  @hasMany(() => Assignment)
  declare assignments: HasMany<typeof Assignment>

  @hasMany(() => Exam)
  declare exams: HasMany<typeof Exam>

  // Many-to-many with Teachers through teacher_has_classes
  @manyToMany(() => Teacher, {
    pivotTable: 'teacher_has_classes',
    localKey: 'id',
    pivotForeignKey: 'class_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'teacher_id',
  })
  declare teachers: ManyToMany<typeof Teacher>
}
