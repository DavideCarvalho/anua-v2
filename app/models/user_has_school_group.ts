import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import SchoolGroup from './school_group.js'

export default class UserHasSchoolGroup extends BaseModel {
  static table = 'UserHasSchoolGroup'

  @beforeCreate()
  static assignId(model: UserHasSchoolGroup) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'schoolGroupId' })
  declare schoolGroupId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => SchoolGroup, { foreignKey: 'schoolGroupId' })
  declare schoolGroup: BelongsTo<typeof SchoolGroup>
}
