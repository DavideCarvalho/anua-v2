import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenPurchase from '#models/canteen_purchase'
import type { CanteenPaymentMethod, CanteenPurchaseStatus } from '#models/canteen_purchase'
import type { DateTime } from 'luxon'
import UserDto from './user.dto.js'
import CanteenDto from './canteen.dto.js'
import CanteenItemPurchasedDto from './canteen_item_purchased.dto.js'

export default class CanteenPurchaseDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare canteenId: string
  declare totalAmount: number
  declare paymentMethod: CanteenPaymentMethod
  declare status: CanteenPurchaseStatus
  declare paidAt: DateTime | null
  declare monthlyTransferId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare user?: UserDto
  declare canteen?: CanteenDto
  declare itemsPurchased?: CanteenItemPurchasedDto[]

  constructor(canteenPurchase?: CanteenPurchase) {
    super()

    if (!canteenPurchase) return

    this.id = canteenPurchase.id
    this.userId = canteenPurchase.userId
    this.canteenId = canteenPurchase.canteenId
    this.totalAmount = canteenPurchase.totalAmount
    this.paymentMethod = canteenPurchase.paymentMethod
    this.status = canteenPurchase.status
    this.paidAt = canteenPurchase.paidAt
    this.monthlyTransferId = canteenPurchase.monthlyTransferId
    this.createdAt = canteenPurchase.createdAt
    this.updatedAt = canteenPurchase.updatedAt
    if (canteenPurchase.user) this.user = new UserDto(canteenPurchase.user)
    if (canteenPurchase.canteen) this.canteen = new CanteenDto(canteenPurchase.canteen)
    if (canteenPurchase.itemsPurchased)
      this.itemsPurchased = canteenPurchase.itemsPurchased.map(
        (i) => new CanteenItemPurchasedDto(i)
      )
  }
}
