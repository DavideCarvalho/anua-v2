import { BaseModelDto } from '@adocasts.com/dto/base'
import type ResponsibleDocument from '#models/responsible_document'
import UserDto from './user.dto.js'

export class ResponsibleDocumentDto extends BaseModelDto {
  declare id: string
  declare responsibleId: string
  declare documentType: string
  declare documentNumber: string
  declare issuingAgency: string | null
  declare issueDate: string | null
  declare expiryDate: string | null
  declare filePath: string | null
  declare verified: boolean
  declare observations: string | null
  declare createdAt: string
  declare updatedAt: string
  declare responsible?: UserDto

  constructor(instance?: ResponsibleDocument) {
    super()

    if (!instance) return

    this.id = instance.id
    this.responsibleId = instance.responsibleId
    this.documentType = instance.documentType
    this.documentNumber = instance.documentNumber
    this.issuingAgency = instance.issuingAgency
    this.issueDate = instance.issueDate ? instance.issueDate.toISO() : null
    this.expiryDate = instance.expiryDate ? instance.expiryDate.toISO() : null
    this.filePath = instance.filePath
    this.verified = instance.verified
    this.observations = instance.observations
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
    this.responsible = instance.responsible ? new UserDto(instance.responsible) : undefined
  }
}

export class CreateResponsibleDocumentDto extends BaseModelDto {
  declare responsibleId: string
  declare documentType: string
  declare documentNumber: string
  declare issuingAgency?: string
  declare issueDate?: string
  declare expiryDate?: string
  declare filePath?: string
  declare verified?: boolean
  declare observations?: string

  constructor(data: {
    responsibleId: string
    documentType: string
    documentNumber: string
    issuingAgency?: string
    issueDate?: string
    expiryDate?: string
    filePath?: string
    verified?: boolean
    observations?: string
  }) {
    super()
    this.responsibleId = data.responsibleId
    this.documentType = data.documentType
    this.documentNumber = data.documentNumber
    this.issuingAgency = data.issuingAgency
    this.issueDate = data.issueDate
    this.expiryDate = data.expiryDate
    this.filePath = data.filePath
    this.verified = data.verified
    this.observations = data.observations
  }
}

export class UpdateResponsibleDocumentDto extends BaseModelDto {
  declare documentType?: string
  declare documentNumber?: string
  declare issuingAgency?: string
  declare issueDate?: string
  declare expiryDate?: string
  declare filePath?: string
  declare verified?: boolean
  declare observations?: string

  constructor(data: {
    documentType?: string
    documentNumber?: string
    issuingAgency?: string
    issueDate?: string
    expiryDate?: string
    filePath?: string
    verified?: boolean
    observations?: string
  }) {
    super()
    this.documentType = data.documentType
    this.documentNumber = data.documentNumber
    this.issuingAgency = data.issuingAgency
    this.issueDate = data.issueDate
    this.expiryDate = data.expiryDate
    this.filePath = data.filePath
    this.verified = data.verified
    this.observations = data.observations
  }
}
