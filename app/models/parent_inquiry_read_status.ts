import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import ParentInquiry from './parent_inquiry.js'

export default class ParentInquiryReadStatus extends BaseModel {
  static table = 'ParentInquiryReadStatus'

  @beforeCreate()
  static assignId(model: ParentInquiryReadStatus) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'inquiryId' })
  declare inquiryId: string

  @column.dateTime({ columnName: 'lastReadAt' })
  declare lastReadAt: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>
}
