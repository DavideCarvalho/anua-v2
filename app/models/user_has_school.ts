import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'

export default class UserHasSchool extends BaseModel {
  static table = 'UserHasSchool'

  @beforeCreate()
  static assignId(userHasSchool: UserHasSchool) {
    if (!userHasSchool.id) {
      userHasSchool.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'isDefault' })
  declare isDefault: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>
}
