import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolGroup from './school_group.js'

export default class SchoolHasGroup extends BaseModel {
  static table = 'SchoolHasGroup'

  @beforeCreate()
  static assignId(model: SchoolHasGroup) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare schoolGroupId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolGroup, { foreignKey: 'schoolGroupId' })
  declare schoolGroup: BelongsTo<typeof SchoolGroup>
}
