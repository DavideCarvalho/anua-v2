import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class StudentAddress extends BaseModel {
  static table = 'StudentAddress'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'street' })
  declare street: string

  @column({ columnName: 'number' })
  declare number: string

  @column({ columnName: 'complement' })
  declare complement: string | null

  @column({ columnName: 'neighborhood' })
  declare neighborhood: string

  @column({ columnName: 'city' })
  declare city: string

  @column({ columnName: 'state' })
  declare state: string

  @column({ columnName: 'zipCode' })
  declare zipCode: string

  @column({ columnName: 'latitude' })
  declare latitude: number | null

  @column({ columnName: 'longitude' })
  declare longitude: number | null

  // PostGIS geometry point - stored as USER-DEFINED type in DB
  // Use raw queries for spatial operations
  @column({ columnName: 'location' })
  declare location: unknown | null

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
