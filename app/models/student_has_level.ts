import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, hasMany, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'
import Level from './level.js'
import AcademicPeriod from './academic_period.js'
import Contract from './contract.js'
import Scholarship from './scholarship.js'
import Class_ from './class.js'
import StudentPayment from './student_payment.js'

export type DocusealSignatureStatus = 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED'

export default class StudentHasLevel extends BaseModel {
  @beforeCreate()
  static assignId(model: StudentHasLevel) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  static table = 'StudentHasLevel'

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'levelAssignedToCourseAcademicPeriodId' })
  declare levelAssignedToCourseAcademicPeriodId: string

  @column({ columnName: 'scholarshipId' })
  declare scholarshipId: string | null

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string | null

  @column({ columnName: 'levelId' })
  declare levelId: string | null

  @column({ columnName: 'classId' })
  declare classId: string | null

  @column({ columnName: 'contractId' })
  declare contractId: string | null

  @column({ columnName: 'contractUrl' })
  declare contractUrl: string | null

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | null

  @column({ columnName: 'enrollmentInstallments' })
  declare enrollmentInstallments: number | null

  @column({ columnName: 'installments' })
  declare installments: number | null

  @column({ columnName: 'paymentDay' })
  declare paymentDay: number | null

  @column({ columnName: 'docusealSubmissionId' })
  declare docusealSubmissionId: string | null

  @column({ columnName: 'docusealSignatureStatus' })
  declare docusealSignatureStatus: DocusealSignatureStatus | null

  @column.date({ columnName: 'documentSignedAt' })
  declare documentSignedAt: DateTime | null

  @column({ columnName: 'enrollmentPaymentId' })
  declare enrollmentPaymentId: string | null

  @column({ columnName: 'signedContractFilePath' })
  declare signedContractFilePath: string | null

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => LevelAssignedToCourseHasAcademicPeriod, {
    foreignKey: 'levelAssignedToCourseAcademicPeriodId',
  })
  declare levelAssignedToCourseAcademicPeriod: BelongsTo<
    typeof LevelAssignedToCourseHasAcademicPeriod
  >

  @belongsTo(() => Level, { foreignKey: 'levelId' })
  declare level: BelongsTo<typeof Level>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @belongsTo(() => Scholarship, { foreignKey: 'scholarshipId' })
  declare scholarship: BelongsTo<typeof Scholarship>

  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @hasMany(() => StudentPayment, { foreignKey: 'studentHasLevelId' })
  declare studentPayments: HasMany<typeof StudentPayment>
}
