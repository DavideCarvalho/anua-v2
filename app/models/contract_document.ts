import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Contract from './contract.js'
import StudentDocument from './student_document.js'

export default class ContractDocument extends BaseModel {
  static table = 'ContractDocument'

  @beforeCreate()
  static assignId(document: ContractDocument) {
    if (!document.id) {
      document.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'required' })
  declare required: boolean

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  @column({ columnName: 'contractId' })
  declare contractId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => StudentDocument, { foreignKey: 'contractDocumentId' })
  declare studentDocuments: HasMany<typeof StudentDocument>
}
