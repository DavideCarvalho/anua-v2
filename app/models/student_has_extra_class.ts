import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import ExtraClass from './extra_class.js'
import Contract from './contract.js'
import Scholarship from './scholarship.js'
import StudentPayment from './student_payment.js'

export default class StudentHasExtraClass extends BaseModel {
  static table = 'StudentHasExtraClass'

  @beforeCreate()
  static assignId(model: StudentHasExtraClass) {
    if (!model.id) model.id = uuidv7()
  }

  @column({ isPrimary: true, columnName: 'id' }) declare id: string
  @column({ columnName: 'studentId' }) declare studentId: string
  @column({ columnName: 'extraClassId' }) declare extraClassId: string
  @column({ columnName: 'contractId' }) declare contractId: string
  @column({ columnName: 'scholarshipId' }) declare scholarshipId: string | null
  @column({ columnName: 'paymentMethod' }) declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  @column({ columnName: 'paymentDay' }) declare paymentDay: number
  @column.dateTime({ columnName: 'enrolledAt' }) declare enrolledAt: DateTime
  @column.dateTime({ columnName: 'cancelledAt' }) declare cancelledAt: DateTime | null
  @column.dateTime({ autoCreate: true, columnName: 'createdAt' }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' }) declare student: BelongsTo<typeof Student>
  @belongsTo(() => ExtraClass, { foreignKey: 'extraClassId' }) declare extraClass: BelongsTo<
    typeof ExtraClass
  >
  @belongsTo(() => Contract, { foreignKey: 'contractId' }) declare contract: BelongsTo<
    typeof Contract
  >
  @belongsTo(() => Scholarship, { foreignKey: 'scholarshipId' }) declare scholarship: BelongsTo<
    typeof Scholarship
  >
  @hasMany(() => StudentPayment, { foreignKey: 'studentHasExtraClassId' })
  declare payments: HasMany<typeof StudentPayment>
}
