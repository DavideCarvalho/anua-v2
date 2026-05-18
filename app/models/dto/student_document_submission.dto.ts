import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentDocumentSubmission from '#models/student_document_submission'
import type { StudentDocumentSubmissionStatus } from '#models/student_document_submission'
import StudentDocumentFileDto from './student_document_file.dto.js'

export default class StudentDocumentSubmissionDto extends BaseModelDto {
  declare id: string
  declare contractDocumentId: string
  declare studentId: string
  declare status: StudentDocumentSubmissionStatus
  declare rejectionReason: string | null
  declare reviewedBy: string | null
  declare reviewedAt: Date | null
  declare submittedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare files?: StudentDocumentFileDto[]

  constructor(model?: StudentDocumentSubmission) {
    super()

    if (!model) return

    this.id = model.id
    this.contractDocumentId = model.contractDocumentId
    this.studentId = model.studentId
    this.status = model.status
    this.rejectionReason = model.rejectionReason
    this.reviewedBy = model.reviewedBy
    this.reviewedAt = model.reviewedAt ? model.reviewedAt.toJSDate() : null
    this.submittedAt = model.submittedAt ? model.submittedAt.toJSDate() : null
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()

    if (model.files) {
      this.files = model.files.map((f) => new StudentDocumentFileDto(f))
    }
  }
}
