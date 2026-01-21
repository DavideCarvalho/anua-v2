import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import SchoolGroup from './school_group.js'

export default class UserHasSchoolGroup extends BaseModel {
  static table = 'UserHasSchoolGroup'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare schoolGroupId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => SchoolGroup, { foreignKey: 'schoolGroupId' })
  declare schoolGroup: BelongsTo<typeof SchoolGroup>
}
