import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ParentInquiryMessage from './parent_inquiry_message.js'

export default class ParentInquiryAttachment extends BaseModel {
  static table = 'ParentInquiryAttachment'

  @beforeCreate()
  static assignId(model: ParentInquiryAttachment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'messageId' })
  declare messageId: string

  @column({ columnName: 'fileName' })
  declare fileName: string

  @column({ columnName: 'filePath' })
  declare filePath: string

  @column({ columnName: 'fileSize' })
  declare fileSize: number

  @column({ columnName: 'mimeType' })
  declare mimeType: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => ParentInquiryMessage, { foreignKey: 'messageId' })
  declare message: BelongsTo<typeof ParentInquiryMessage>
}
