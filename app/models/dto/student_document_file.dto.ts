import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentDocumentFile from '#models/student_document_file'

export default class StudentDocumentFileDto extends BaseModelDto {
  declare id: string
  declare submissionId: string
  declare fileName: string
  declare fileUrl: string
  declare mimeType: string
  declare size: number
  declare ord: number
  declare createdAt: Date

  constructor(model?: StudentDocumentFile) {
    super()

    if (!model) return

    this.id = model.id
    this.submissionId = model.submissionId
    this.fileName = model.fileName
    this.fileUrl = model.fileUrl
    this.mimeType = model.mimeType
    this.size = model.size
    this.ord = model.ord
    this.createdAt = model.createdAt.toJSDate()
  }
}
