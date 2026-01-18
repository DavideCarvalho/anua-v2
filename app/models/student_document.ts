import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'
import ContractDocument from './contract_document.js'

export default class StudentDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare fileName: string

  @column()
  declare fileUrl: string

  @column()
  declare mimeType: string

  @column()
  declare size: number

  @column()
  declare status: 'PENDING' | 'APPROVED' | 'REJECTED'

  @column()
  declare reviewedBy: string | null

  @column.dateTime()
  declare reviewedAt: DateTime | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare contractDocumentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'reviewedBy' })
  declare reviewer: BelongsTo<typeof User>

  @belongsTo(() => ContractDocument)
  declare contractDocument: BelongsTo<typeof ContractDocument>
}
