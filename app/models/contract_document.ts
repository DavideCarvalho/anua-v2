import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Contract from './contract.js'
import StudentDocument from './student_document.js'

export default class ContractDocument extends BaseModel {
  static table = 'ContractDocument'

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
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => StudentDocument, { foreignKey: 'contractDocumentId' })
  declare studentDocuments: HasMany<typeof StudentDocument>
}
