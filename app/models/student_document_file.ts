import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentDocumentSubmission from './student_document_submission.js'

export default class StudentDocumentFile extends BaseModel {
  static table = 'StudentDocumentFile'

  @beforeCreate()
  static assignId(model: StudentDocumentFile) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'submissionId' })
  declare submissionId: string

  @column({ columnName: 'fileName' })
  declare fileName: string

  @column({ columnName: 'fileUrl' })
  declare fileUrl: string

  @column({ columnName: 'mimeType' })
  declare mimeType: string

  @column({ columnName: 'size' })
  declare size: number

  @column({ columnName: 'ord' })
  declare ord: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => StudentDocumentSubmission, { foreignKey: 'submissionId' })
  declare submission: BelongsTo<typeof StudentDocumentSubmission>
}
