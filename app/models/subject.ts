import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'

export default class Subject extends BaseModel {
  static table = 'Subject'

  @beforeCreate()
  static assignId(subject: Subject) {
    if (!subject.id) {
      subject.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  declare slug: string

  @column({ columnName: 'quantityNeededScheduled' })
  declare quantityNeededScheduled: number

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  // Note: Other relationships will be added when their models are created:
  // - TeacherHasClass
  // - TeacherHasSubject
  // - Exam
  // - Leaderboard
}
