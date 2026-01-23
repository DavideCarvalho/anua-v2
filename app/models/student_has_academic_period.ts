import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import AcademicPeriod from './academic_period.js'
import Class from './class.js'

export default class StudentHasAcademicPeriod extends BaseModel {
  static table = 'StudentHasAcademicPeriod'

  @beforeCreate()
  static assignId(model: StudentHasAcademicPeriod) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column({ columnName: 'classId' })
  declare classId: string | null

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>
}
