import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'
import ContractDocument from './contract_document.js'
import StudentDocumentFile from './student_document_file.js'

export type StudentDocumentSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export default class StudentDocumentSubmission extends BaseModel {
  static table = 'StudentDocumentSubmission'

  @beforeCreate()
  static assignId(model: StudentDocumentSubmission) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'contractDocumentId' })
  declare contractDocumentId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'status' })
  declare status: StudentDocumentSubmissionStatus

  @column({ columnName: 'rejectionReason' })
  declare rejectionReason: string | null

  @column({ columnName: 'reviewedBy' })
  declare reviewedBy: string | null

  @column.dateTime({ columnName: 'reviewedAt' })
  declare reviewedAt: DateTime | null

  @column.dateTime({ columnName: 'submittedAt' })
  declare submittedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => ContractDocument, { foreignKey: 'contractDocumentId' })
  declare contractDocument: BelongsTo<typeof ContractDocument>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'reviewedBy' })
  declare reviewer: BelongsTo<typeof User>

  @hasMany(() => StudentDocumentFile, { foreignKey: 'submissionId' })
  declare files: HasMany<typeof StudentDocumentFile>
}
