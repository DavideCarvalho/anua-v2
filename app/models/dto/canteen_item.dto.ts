import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenItem from '#models/canteen_item'
import CanteenDto from './canteen.dto.js'

export default class CanteenItemDto extends BaseModelDto {
  declare id: string
  declare canteenId: string
  declare name: string
  declare description: string | null
  declare price: number
  declare category: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare canteen?: CanteenDto

  constructor(canteenItem?: CanteenItem) {
    super()

    if (!canteenItem) return

    this.id = canteenItem.id
    this.canteenId = canteenItem.canteenId
    this.name = canteenItem.name
    this.description = canteenItem.description
    this.price = canteenItem.price
    this.category = canteenItem.category
    this.isActive = canteenItem.isActive
    this.createdAt = canteenItem.createdAt.toJSDate()
    this.updatedAt = canteenItem.updatedAt.toJSDate()
    if (canteenItem.canteen) this.canteen = new CanteenDto(canteenItem.canteen)
  }
}
