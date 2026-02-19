import { BaseModelDto } from '@adocasts.com/dto/base'
import type { DateTime } from 'luxon'

export class DocumentTypeDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare isRequired: boolean

  constructor(data: { id: string; name: string; description: string | null; isRequired: boolean }) {
    super()
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.isRequired = data.isRequired
  }
}

export class StudentDocumentDto extends BaseModelDto {
  declare id: string
  declare fileName: string
  declare fileUrl: string
  declare mimeType: string
  declare size: number
  declare status: string
  declare rejectionReason: string | null
  declare reviewedAt: Date | null
  declare createdAt: Date
  declare documentType: DocumentTypeDto
  declare reviewerName: string | null

  constructor(data: {
    id: string
    fileName: string
    fileUrl: string
    mimeType: string
    size: number
    status: string
    rejectionReason: string | null
    reviewedAt: DateTime | string | null
    createdAt: DateTime | string
    documentType: DocumentTypeDto
    reviewerName: string | null
  }) {
    super()
    this.id = data.id
    this.fileName = data.fileName
    this.fileUrl = data.fileUrl
    this.mimeType = data.mimeType
    this.size = data.size
    this.status = data.status
    this.rejectionReason = data.rejectionReason
    this.reviewedAt = data.reviewedAt
      ? typeof data.reviewedAt === 'string'
        ? new Date(data.reviewedAt)
        : data.reviewedAt.toJSDate()
      : null
    this.createdAt =
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toJSDate()
    this.documentType = data.documentType
    this.reviewerName = data.reviewerName
  }
}

export class MissingDocumentDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare isRequired: boolean

  constructor(data: { id: string; name: string; description: string | null; isRequired: boolean }) {
    super()
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.isRequired = data.isRequired
  }
}

export class DocumentsSummaryDto extends BaseModelDto {
  declare total: number
  declare pending: number
  declare approved: number
  declare rejected: number
  declare requiredMissing: number

  constructor(data: {
    total: number
    pending: number
    approved: number
    rejected: number
    requiredMissing: number
  }) {
    super()
    this.total = data.total
    this.pending = data.pending
    this.approved = data.approved
    this.rejected = data.rejected
    this.requiredMissing = data.requiredMissing
  }
}

export class StudentDocumentsResponseDto extends BaseModelDto {
  declare documents: StudentDocumentDto[]
  declare missingDocuments: MissingDocumentDto[]
  declare summary: DocumentsSummaryDto

  constructor(data: {
    documents: StudentDocumentDto[]
    missingDocuments: MissingDocumentDto[]
    summary: DocumentsSummaryDto
  }) {
    super()
    this.documents = data.documents
    this.missingDocuments = data.missingDocuments
    this.summary = data.summary
  }
}
