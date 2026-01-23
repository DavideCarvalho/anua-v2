import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import Subject from './subject.js'
import Teacher from './teacher.js'
import School from './school.js'
import AcademicPeriod from './academic_period.js'
import ExamGrade from './exam_grade.js'

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ExamType = 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ'
export type ExamLocation = 'CLASSROOM' | 'AUDITORIUM' | 'LABORATORY' | 'ONLINE' | 'OTHER'

export default class Exam extends BaseModel {
  static table = 'Exam'

  @beforeCreate()
  static assignId(model: Exam) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'title' })
  declare title: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column.dateTime({ columnName: 'examDate' })
  declare examDate: DateTime

  @column.dateTime({ columnName: 'startTime' })
  declare startTime: DateTime | null

  @column.dateTime({ columnName: 'endTime' })
  declare endTime: DateTime | null

  @column({ columnName: 'location' })
  declare location: ExamLocation | null

  @column({ columnName: 'maxScore' })
  declare maxScore: number

  @column({ columnName: 'weight' })
  declare weight: number

  @column({ columnName: 'type' })
  declare type: ExamType

  @column({ columnName: 'status' })
  declare status: ExamStatus

  @column({ columnName: 'instructions' })
  declare instructions: string | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'classId' })
  declare classId: string

  @column({ columnName: 'subjectId' })
  declare subjectId: string | null

  @column({ columnName: 'teacherId' })
  declare teacherId: string

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => ExamGrade, { foreignKey: 'examId' })
  declare grades: HasMany<typeof ExamGrade>
}
