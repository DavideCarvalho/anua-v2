import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export type PlotState = 'empty' | 'growing' | 'ready'

export type CropType = 'carrot' | 'tomato' | 'corn' | 'pumpkin' | 'eggplant'

export interface Plot {
  id: number
  state: PlotState
  cropType: CropType | null
  plantedAt: string | null
}

export default class StudentFarm extends BaseModel {
  static table = 'StudentFarm'

  @beforeCreate()
  static assignId(model: StudentFarm) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column()
  declare seeds: number

  @column({
    prepare: (value: Plot[]) => JSON.stringify(value),
    consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare plots: Plot[]

  @column({ columnName: 'pointsEarnedToday' })
  declare pointsEarnedToday: number

  @column.date({ columnName: 'pointsResetAt' })
  declare pointsResetAt: DateTime | null

  @column.dateTime({ columnName: 'lastDailyAt' })
  declare lastDailyAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
