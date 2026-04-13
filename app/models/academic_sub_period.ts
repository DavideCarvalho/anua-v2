import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import AcademicPeriod from './academic_period.js'
import Exam from './exam.js'
import Assignment from './assignment.js'

export default class AcademicSubPeriod extends BaseModel {
  static table = 'AcademicSubPeriod'

  @beforeCreate()
  static assignId(academicSubPeriod: AcademicSubPeriod) {
    if (!academicSubPeriod.id) {
      academicSubPeriod.id = uuidv7()
    }
  }

  @beforeCreate()
  static generateSlug(academicSubPeriod: AcademicSubPeriod) {
    if (!academicSubPeriod.slug) {
      academicSubPeriod.slug = academicSubPeriod.name
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  declare slug: string

  @column({ columnName: 'order' })
  declare order: number

  @column.date({ columnName: 'startDate' })
  declare startDate: DateTime

  @column.date({ columnName: 'endDate' })
  declare endDate: DateTime

  @column({ columnName: 'weight' })
  declare weight: number

  @column({ columnName: 'minimumGrade' })
  declare minimumGrade: number | null

  @column({ columnName: 'hasRecovery' })
  declare hasRecovery: boolean

  @column.date({ columnName: 'recoveryStartDate' })
  declare recoveryStartDate: DateTime | null

  @column.date({ columnName: 'recoveryEndDate' })
  declare recoveryEndDate: DateTime | null

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => Exam, { foreignKey: 'subPeriodId' })
  declare exams: HasMany<typeof Exam>

  @hasMany(() => Assignment, { foreignKey: 'subPeriodId' })
  declare assignments: HasMany<typeof Assignment>
}
