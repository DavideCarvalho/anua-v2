import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Contract from './contract.js'
import Class_ from './class.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'

export default class Level extends BaseModel {
  static table = 'Level'

  @beforeCreate()
  static assignId(level: Level) {
    if (!level.id) {
      level.id = uuidv7()
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

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'contractId' })
  declare contractId: string | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => Class_, { foreignKey: 'levelId' })
  declare classes: HasMany<typeof Class_>

  @hasMany(() => LevelAssignedToCourseHasAcademicPeriod, { foreignKey: 'levelId' })
  declare levelAssignments: HasMany<typeof LevelAssignedToCourseHasAcademicPeriod>
}
