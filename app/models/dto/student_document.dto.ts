import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentDocument from '#models/student_document'
import type { DateTime } from 'luxon'

export default class StudentDocumentDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare fileName: string
  declare fileUrl: string
  declare mimeType: string
  declare size: number
  declare status: 'PENDING' | 'APPROVED' | 'REJECTED'
  declare reviewedBy: string | null
  declare reviewedAt: DateTime | null
  declare rejectionReason: string | null
  declare contractDocumentId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentDocument) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.fileName = model.fileName
    this.fileUrl = model.fileUrl
    this.mimeType = model.mimeType
    this.size = model.size
    this.status = model.status
    this.reviewedBy = model.reviewedBy
    this.reviewedAt = model.reviewedAt
    this.rejectionReason = model.rejectionReason
    this.contractDocumentId = model.contractDocumentId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
