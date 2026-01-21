import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'
import Level from './level.js'
import AcademicPeriod from './academic_period.js'
import Contract from './contract.js'
import Scholarship from './scholarship.js'
import Class_ from './class.js'

export type DocusealSignatureStatus = 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED'

export default class StudentHasLevel extends BaseModel {
  @beforeCreate()
  static assignId(model: StudentHasLevel) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  static table = 'StudentHasLevel'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare levelAssignedToCourseAcademicPeriodId: string

  @column()
  declare scholarshipId: string | null

  @column()
  declare academicPeriodId: string | null

  @column()
  declare levelId: string | null

  @column()
  declare classId: string | null

  @column()
  declare contractId: string | null

  @column()
  declare contractUrl: string | null

  @column()
  declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | null

  @column()
  declare enrollmentInstallments: number | null

  @column()
  declare installments: number | null

  @column()
  declare paymentDay: number | null

  @column()
  declare docusealSubmissionId: string | null

  @column()
  declare docusealSignatureStatus: DocusealSignatureStatus | null

  @column.date()
  declare documentSignedAt: DateTime | null

  @column()
  declare enrollmentPaymentId: string | null

  @column()
  declare signedContractFilePath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
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
}
