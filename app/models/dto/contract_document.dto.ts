import { BaseModelDto } from '@adocasts.com/dto/base'
import type ContractDocument from '#models/contract_document'
import SchoolDto from './school.dto.js'

export class ContractDocumentDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare required: boolean
  declare schoolId: string | null
  declare contractId: string | null
  declare createdAt: string
  declare updatedAt: string
  declare school?: SchoolDto

  constructor(instance?: ContractDocument) {
    super()

    if (!instance) return

    this.id = instance.id
    this.name = instance.name
    this.description = instance.description
    this.required = instance.required
    this.schoolId = instance.schoolId
    this.contractId = instance.contractId
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
    this.school = instance.school ? new SchoolDto(instance.school) : undefined
  }
}

export class CreateContractDocumentDto extends BaseModelDto {
  declare name: string
  declare description?: string
  declare required?: boolean
  declare schoolId?: string
  declare contractId?: string

  constructor(data: {
    name: string
    description?: string
    required?: boolean
    schoolId?: string
    contractId?: string
  }) {
    super()
    this.name = data.name
    this.description = data.description
    this.required = data.required
    this.schoolId = data.schoolId
    this.contractId = data.contractId
  }
}

export class UpdateContractDocumentDto extends BaseModelDto {
  declare name?: string
  declare description?: string
  declare required?: boolean
  declare schoolId?: string
  declare contractId?: string

  constructor(data: {
    name?: string
    description?: string
    required?: boolean
    schoolId?: string
    contractId?: string
  }) {
    super()
    this.name = data.name
    this.description = data.description
    this.required = data.required
    this.schoolId = data.schoolId
    this.contractId = data.contractId
  }
}
