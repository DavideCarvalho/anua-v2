import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import AcademicPeriod from './academic_period.js'
import Contract from './contract.js'
import Teacher from './teacher.js'
import ExtraClassSchedule from './extra_class_schedule.js'
import StudentHasExtraClass from './student_has_extra_class.js'
import ExtraClassAttendance from './extra_class_attendance.js'

export default class ExtraClass extends BaseModel {
  static table = 'ExtraClass'

  @beforeCreate()
  static assignId(model: ExtraClass) {
    if (!model.id) model.id = uuidv7()
  }

  @column({ isPrimary: true, columnName: 'id' }) declare id: string
  @column({ columnName: 'name' }) declare name: string
  @column({ columnName: 'slug' }) declare slug: string
  @column({ columnName: 'description' }) declare description: string | null
  @column({ columnName: 'schoolId' }) declare schoolId: string
  @column({ columnName: 'academicPeriodId' }) declare academicPeriodId: string
  @column({ columnName: 'contractId' }) declare contractId: string
  @column({ columnName: 'teacherId' }) declare teacherId: string
  @column({ columnName: 'maxStudents' }) declare maxStudents: number | null
  @column({ columnName: 'isActive' }) declare isActive: boolean
  @column.dateTime({ autoCreate: true, columnName: 'createdAt' }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' }) declare school: BelongsTo<typeof School>
  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>
  @belongsTo(() => Contract, { foreignKey: 'contractId' }) declare contract: BelongsTo<
    typeof Contract
  >
  @belongsTo(() => Teacher, { foreignKey: 'teacherId' }) declare teacher: BelongsTo<typeof Teacher>
  @hasMany(() => ExtraClassSchedule, { foreignKey: 'extraClassId' }) declare schedules: HasMany<
    typeof ExtraClassSchedule
  >
  @hasMany(() => StudentHasExtraClass, { foreignKey: 'extraClassId' }) declare enrollments: HasMany<
    typeof StudentHasExtraClass
  >
  @hasMany(() => ExtraClassAttendance, { foreignKey: 'extraClassId' }) declare attendances: HasMany<
    typeof ExtraClassAttendance
  >
}
