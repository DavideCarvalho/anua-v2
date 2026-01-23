import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'
import ContractDocument from './contract_document.js'

export default class StudentDocument extends BaseModel {
  static table = 'StudentDocument'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'fileName' })
  declare fileName: string

  @column({ columnName: 'fileUrl' })
  declare fileUrl: string

  @column({ columnName: 'mimeType' })
  declare mimeType: string

  @column({ columnName: 'size' })
  declare size: number

  @column({ columnName: 'status' })
  declare status: 'PENDING' | 'APPROVED' | 'REJECTED'

  @column({ columnName: 'reviewedBy' })
  declare reviewedBy: string | null

  @column.dateTime({ columnName: 'reviewedAt' })
  declare reviewedAt: DateTime | null

  @column({ columnName: 'rejectionReason' })
  declare rejectionReason: string | null

  @column({ columnName: 'contractDocumentId' })
  declare contractDocumentId: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'reviewedBy' })
  declare reviewer: BelongsTo<typeof User>

  @belongsTo(() => ContractDocument, { foreignKey: 'contractDocumentId' })
  declare contractDocument: BelongsTo<typeof ContractDocument>
}
