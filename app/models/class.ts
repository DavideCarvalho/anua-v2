import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import {
  BaseModel,
  beforeCreate,
  column,
  belongsTo,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Level from './level.js'
import School from './school.js'
import Student from './student.js'
import StudentHasLevel from './student_has_level.js'
import Teacher from './teacher.js'
import Exam from './exam.js'
import TeacherHasClass from './teacher_has_class.js'
import AcademicPeriod from './academic_period.js'

// eslint-disable-next-line @typescript-eslint/naming-convention -- Using underscore suffix to avoid JS reserved keyword 'class'
export default class Class_ extends BaseModel {
  static table = 'Class'

  @beforeCreate()
  static assignId(classEntity: Class_) {
    if (!classEntity.id) {
      classEntity.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  declare slug: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'levelId' })
  declare levelId: string | null

  @column({ columnName: 'isArchived' })
  declare isArchived: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Level, { foreignKey: 'levelId' })
  declare level: BelongsTo<typeof Level>

  @hasMany(() => Student, { foreignKey: 'classId' })
  declare students: HasMany<typeof Student>

  @hasMany(() => StudentHasLevel, { foreignKey: 'classId' })
  declare studentLevels: HasMany<typeof StudentHasLevel>

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

  // Many-to-many with AcademicPeriods through ClassHasAcademicPeriod
  @manyToMany(() => AcademicPeriod, {
    pivotTable: 'ClassHasAcademicPeriod',
    localKey: 'id',
    pivotForeignKey: 'classId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'academicPeriodId',
  })
  declare academicPeriods: ManyToMany<typeof AcademicPeriod>
}
