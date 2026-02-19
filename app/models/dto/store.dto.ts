import { BaseModelDto } from '@adocasts.com/dto/base'
import type Store from '#models/store'
import type { StoreType } from '#models/store'

export default class StoreDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare ownerUserId: string | null
  declare name: string
  declare description: string | null
  declare type: StoreType
  declare commissionPercentage: number | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare deletedAt: Date | null
  declare owner: { id: string; name: string } | null

  constructor(store?: Store) {
    super()

    if (!store) return

    this.id = store.id
    this.schoolId = store.schoolId
    this.ownerUserId = store.ownerUserId
    this.name = store.name
    this.description = store.description
    this.type = store.type
    this.commissionPercentage = store.commissionPercentage
    this.isActive = store.isActive
    this.createdAt = store.createdAt.toJSDate()
    this.updatedAt = store.updatedAt.toJSDate()
    this.deletedAt = store.deletedAt ? store.deletedAt.toJSDate() : null
    this.owner = store.owner ? { id: store.owner.id, name: store.owner.name } : null
  }
}
