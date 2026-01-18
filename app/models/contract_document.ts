import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Contract from './contract.js'
import StudentDocument from './student_document.js'

export default class ContractDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare required: boolean

  @column()
  declare schoolId: string | null

  @column()
  declare contractId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Contract)
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => StudentDocument)
  declare studentDocuments: HasMany<typeof StudentDocument>
}
