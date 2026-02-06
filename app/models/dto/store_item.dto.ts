import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreItem from '#models/store_item'
import type { StoreItemPaymentMode, StoreItemCategory, StoreItemPeriod } from '#models/store_item'
import type { DateTime } from 'luxon'
import SchoolDto from './school.dto.js'
import CanteenItemDto from './canteen_item.dto.js'

export default class StoreItemDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare storeId: string | null
  declare canteenItemId: string | null
  declare name: string
  declare description: string | null
  declare price: number
  declare paymentMode: StoreItemPaymentMode
  declare pointsToMoneyRate: number | null
  declare minPointsPercentage: number | null
  declare maxPointsPercentage: number | null
  declare category: StoreItemCategory
  declare imageUrl: string | null
  declare totalStock: number | null
  declare maxPerStudent: number | null
  declare maxPerStudentPeriod: StoreItemPeriod | null
  declare preparationTimeMinutes: number | null
  declare requiresApproval: boolean
  declare pickupLocation: string | null
  declare availableFrom: DateTime | null
  declare availableUntil: DateTime | null
  declare isActive: boolean
  declare metadata: Record<string, unknown> | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare deletedAt: DateTime | null
  declare school?: SchoolDto
  declare canteenItem?: CanteenItemDto

  constructor(model?: StoreItem) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.storeId = model.storeId
    this.canteenItemId = model.canteenItemId
    this.name = model.name
    this.description = model.description
    this.price = model.price
    this.paymentMode = model.paymentMode
    this.pointsToMoneyRate = model.pointsToMoneyRate
    this.minPointsPercentage = model.minPointsPercentage
    this.maxPointsPercentage = model.maxPointsPercentage
    this.category = model.category
    this.imageUrl = model.imageUrl
    this.totalStock = model.totalStock
    this.maxPerStudent = model.maxPerStudent
    this.maxPerStudentPeriod = model.maxPerStudentPeriod
    this.preparationTimeMinutes = model.preparationTimeMinutes
    this.requiresApproval = model.requiresApproval
    this.pickupLocation = model.pickupLocation
    this.availableFrom = model.availableFrom
    this.availableUntil = model.availableUntil
    this.isActive = model.isActive
    this.metadata = model.metadata
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
    this.deletedAt = model.deletedAt
    this.school = model.school ? new SchoolDto(model.school) : undefined
    this.canteenItem = model.canteenItem ? new CanteenItemDto(model.canteenItem) : undefined
  }
}
