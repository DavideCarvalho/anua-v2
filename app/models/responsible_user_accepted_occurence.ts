import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Occurrence from './occurrence.js'

export default class ResponsibleUserAcceptedOccurence extends BaseModel {
  static table = 'ResponsibleUserAcceptedOccurence'

  @beforeCreate()
  static assignId(model: ResponsibleUserAcceptedOccurence) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare responsibleUserId: string

  @column()
  declare occurenceId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'responsibleUserId' })
  declare responsibleUser: BelongsTo<typeof User>

  @belongsTo(() => Occurrence, { foreignKey: 'occurenceId' })
  declare occurence: BelongsTo<typeof Occurrence>
}
