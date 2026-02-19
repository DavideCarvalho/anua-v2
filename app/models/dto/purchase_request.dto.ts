import { BaseModelDto } from '@adocasts.com/dto/base'
import type PurchaseRequest from '#models/purchase_request'
import type { PurchaseRequestStatus } from '#models/purchase_request'
import UserDto from './user.dto.js'

export default class PurchaseRequestDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare requestingUserId: string
  declare productName: string
  declare quantity: number
  declare finalQuantity: number | null
  declare status: PurchaseRequestStatus
  declare proposal: string | null
  declare dueDate: Date
  declare value: number
  declare unitValue: number
  declare finalUnitValue: number | null
  declare finalValue: number | null
  declare description: string | null
  declare productUrl: string | null
  declare purchaseDate: Date | null
  declare estimatedArrivalDate: Date | null
  declare arrivalDate: Date | null
  declare rejectionReason: string | null
  declare receiptPath: string | null
  declare createdAt: Date
  declare updatedAt: Date | null
  declare requestingUser?: UserDto

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
    this.dueDate = model.dueDate.toJSDate()
    this.value = model.value
    this.unitValue = model.unitValue
    this.finalUnitValue = model.finalUnitValue
    this.finalValue = model.finalValue
    this.description = model.description
    this.productUrl = model.productUrl
    this.purchaseDate = model.purchaseDate ? model.purchaseDate.toJSDate() : null
    this.estimatedArrivalDate = model.estimatedArrivalDate
      ? model.estimatedArrivalDate.toJSDate()
      : null
    this.arrivalDate = model.arrivalDate ? model.arrivalDate.toJSDate() : null
    this.rejectionReason = model.rejectionReason
    this.receiptPath = model.receiptPath
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt ? model.updatedAt.toJSDate() : null
    this.requestingUser = model.requestingUser ? new UserDto(model.requestingUser) : undefined
  }
}
