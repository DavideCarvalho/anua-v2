import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    const hasExamGradeRecoveryGrade = await this.schema.hasColumn('exam_grades', 'recoveryGrade')
    if (!hasExamGradeRecoveryGrade) {
      this.schema.alterTable('exam_grades', (table) => {
        table.float('recoveryGrade', 8).nullable()
        table.timestamp('recoveryGradeDate').nullable()
      })
    }

    const hasStudentHasAssignmentRecoveryGrade = await this.schema.hasColumn(
      'StudentHasAssignment',
      'recoveryGrade'
    )
    if (!hasStudentHasAssignmentRecoveryGrade) {
      this.schema.alterTable('StudentHasAssignment', (table) => {
        table.float('recoveryGrade', 8).nullable()
        table.timestamp('recoveryGradeDate').nullable()
      })
    }
  }

  async down() {
    this.schema.alterTable('exam_grades', (table) => {
      table.dropColumn('recoveryGrade')
      table.dropColumn('recoveryGradeDate')
    })

    this.schema.alterTable('StudentHasAssignment', (table) => {
      table.dropColumn('recoveryGrade')
      table.dropColumn('recoveryGradeDate')
    })
  }
}
