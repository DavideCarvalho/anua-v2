import { BaseModelDto } from '@adocasts.com/dto/base'
import type Contract from '#models/contract'
import type { ContractPaymentType } from '#models/contract'
import SchoolDto from './school.dto.js'
import { ContractDocumentDto } from './contract_document.dto.js'
import { ContractPaymentDayDto } from './contract_payment_day.dto.js'
import { ContractInterestConfigDto } from './contract_interest_config.dto.js'
import { ContractEarlyDiscountDto } from './contract_early_discount.dto.js'

export class ContractDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare academicPeriodId: string | null
  declare name: string
  declare description: string | null
  declare endDate: string | null
  declare enrollmentValue: number | null
  declare amount: number
  declare docusealTemplateId: string | null
  declare paymentType: ContractPaymentType
  declare enrollmentValueInstallments: number
  declare enrollmentPaymentUntilDays: number | null
  declare installments: number
  declare flexibleInstallments: boolean
  declare isActive: boolean
  declare hasInsurance: boolean
  declare createdAt: string
  declare updatedAt: string
  declare school?: SchoolDto
  declare contractDocuments?: ContractDocumentDto[]
  declare paymentDays?: ContractPaymentDayDto[]
  declare interestConfig?: ContractInterestConfigDto
  declare earlyDiscounts?: ContractEarlyDiscountDto[]

  constructor(instance?: Contract) {
    super()

    if (!instance) return

    this.id = instance.id
    this.schoolId = instance.schoolId
    this.academicPeriodId = instance.academicPeriodId
    this.name = instance.name
    this.description = instance.description
    this.endDate = instance.endDate ? instance.endDate.toISO() : null
    this.enrollmentValue = instance.enrollmentValue
    this.amount = instance.amount
    this.docusealTemplateId = instance.docusealTemplateId
    this.paymentType = instance.paymentType
    this.enrollmentValueInstallments = instance.enrollmentValueInstallments
    this.enrollmentPaymentUntilDays = instance.enrollmentPaymentUntilDays
    this.installments = instance.installments
    this.flexibleInstallments = instance.flexibleInstallments
    this.isActive = instance.isActive
    this.hasInsurance = instance.hasInsurance
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
    this.school = instance.school ? new SchoolDto(instance.school) : undefined
    this.contractDocuments = instance.contractDocuments
      ? ContractDocumentDto.fromArray(instance.contractDocuments)
      : undefined
    this.paymentDays = instance.paymentDays
      ? ContractPaymentDayDto.fromArray(instance.paymentDays)
      : undefined
    this.interestConfig = instance.interestConfig
      ? new ContractInterestConfigDto(instance.interestConfig)
      : undefined
    this.earlyDiscounts = instance.earlyDiscounts
      ? ContractEarlyDiscountDto.fromArray(instance.earlyDiscounts)
      : undefined
  }
}

export class CreateContractDto extends BaseModelDto {
  declare schoolId: string
  declare academicPeriodId?: string
  declare name: string
  declare description?: string
  declare endDate?: string
  declare enrollmentValue?: number
  declare amount: number
  declare docusealTemplateId?: string
  declare paymentType: ContractPaymentType
  declare enrollmentValueInstallments?: number
  declare enrollmentPaymentUntilDays?: number
  declare installments?: number
  declare flexibleInstallments?: boolean
  declare hasInsurance?: boolean

  constructor(data: {
    schoolId: string
    academicPeriodId?: string
    name: string
    description?: string
    endDate?: string
    enrollmentValue?: number
    amount: number
    docusealTemplateId?: string
    paymentType: ContractPaymentType
    enrollmentValueInstallments?: number
    enrollmentPaymentUntilDays?: number
    installments?: number
    flexibleInstallments?: boolean
    hasInsurance?: boolean
  }) {
    super()
    this.schoolId = data.schoolId
    this.academicPeriodId = data.academicPeriodId
    this.name = data.name
    this.description = data.description
    this.endDate = data.endDate
    this.enrollmentValue = data.enrollmentValue
    this.amount = data.amount
    this.docusealTemplateId = data.docusealTemplateId
    this.paymentType = data.paymentType
    this.enrollmentValueInstallments = data.enrollmentValueInstallments
    this.enrollmentPaymentUntilDays = data.enrollmentPaymentUntilDays
    this.installments = data.installments
    this.flexibleInstallments = data.flexibleInstallments
    this.hasInsurance = data.hasInsurance
  }
}

export class UpdateContractDto extends BaseModelDto {
  declare name?: string
  declare description?: string
  declare endDate?: string
  declare enrollmentValue?: number
  declare amount?: number
  declare docusealTemplateId?: string
  declare paymentType?: ContractPaymentType
  declare enrollmentValueInstallments?: number
  declare enrollmentPaymentUntilDays?: number
  declare installments?: number
  declare flexibleInstallments?: boolean
  declare isActive?: boolean
  declare hasInsurance?: boolean

  constructor(data: {
    name?: string
    description?: string
    endDate?: string
    enrollmentValue?: number
    amount?: number
    docusealTemplateId?: string
    paymentType?: ContractPaymentType
    enrollmentValueInstallments?: number
    enrollmentPaymentUntilDays?: number
    installments?: number
    flexibleInstallments?: boolean
    isActive?: boolean
    hasInsurance?: boolean
  }) {
    super()
    this.name = data.name
    this.description = data.description
    this.endDate = data.endDate
    this.enrollmentValue = data.enrollmentValue
    this.amount = data.amount
    this.docusealTemplateId = data.docusealTemplateId
    this.paymentType = data.paymentType
    this.enrollmentValueInstallments = data.enrollmentValueInstallments
    this.enrollmentPaymentUntilDays = data.enrollmentPaymentUntilDays
    this.installments = data.installments
    this.flexibleInstallments = data.flexibleInstallments
    this.isActive = data.isActive
    this.hasInsurance = data.hasInsurance
  }
}
