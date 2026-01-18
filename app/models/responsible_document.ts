import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ResponsibleDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare responsibleId: string

  @column()
  declare documentType: string

  @column()
  declare documentNumber: string

  @column()
  declare issuingAgency: string | null

  @column.date()
  declare issueDate: DateTime | null

  @column.date()
  declare expiryDate: DateTime | null

  @column()
  declare filePath: string | null

  @column()
  declare verified: boolean

  @column()
  declare observations: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamento
  @belongsTo(() => User, {
    foreignKey: 'responsibleId',
  })
  declare responsible: BelongsTo<typeof User>
}
