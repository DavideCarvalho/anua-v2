import { BaseModelDto } from '@adocasts.com/dto/base'
import type PurchaseRequest from '#models/purchase_request'
import type { PurchaseRequestStatus } from '#models/purchase_request'
import type { DateTime } from 'luxon'

export default class PurchaseRequestDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare requestingUserId: string
  declare productName: string
  declare quantity: number
  declare finalQuantity: number | null
  declare status: PurchaseRequestStatus
  declare proposal: string | null
  declare dueDate: DateTime
  declare value: number
  declare unitValue: number
  declare finalUnitValue: number | null
  declare finalValue: number | null
  declare description: string | null
  declare productUrl: string | null
  declare purchaseDate: DateTime | null
  declare estimatedArrivalDate: DateTime | null
  declare arrivalDate: DateTime | null
  declare rejectionReason: string | null
  declare receiptPath: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(model?: PurchaseRequest) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.requestingUserId = model.requestingUserId
    this.productName = model.productName
    this.quantity = model.quantity
    this.finalQuantity = model.finalQuantity
    this.status = model.status
    this.proposal = model.proposal
    this.dueDate = model.dueDate
    this.value = model.value
    this.unitValue = model.unitValue
    this.finalUnitValue = model.finalUnitValue
    this.finalValue = model.finalValue
    this.description = model.description
    this.productUrl = model.productUrl
    this.purchaseDate = model.purchaseDate
    this.estimatedArrivalDate = model.estimatedArrivalDate
    this.arrivalDate = model.arrivalDate
    this.rejectionReason = model.rejectionReason
    this.receiptPath = model.receiptPath
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
