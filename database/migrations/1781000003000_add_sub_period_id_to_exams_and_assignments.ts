import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    const hasExamSubPeriodId = await this.schema.hasColumn('exams', 'subPeriodId')
    if (!hasExamSubPeriodId) {
      this.schema.alterTable('exams', (table) => {
        table
          .text('subPeriodId')
          .nullable()
          .references('id')
          .inTable('AcademicSubPeriod')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')

        table.index(['subPeriodId'])
      })
    }

    const hasAssignmentSubPeriodId = await this.schema.hasColumn('Assignment', 'subPeriodId')
    if (!hasAssignmentSubPeriodId) {
      this.schema.alterTable('Assignment', (table) => {
        table
          .text('subPeriodId')
          .nullable()
          .references('id')
          .inTable('AcademicSubPeriod')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')

        table.index(['subPeriodId'])
      })
    }
  }

  async down() {
    this.schema.alterTable('exams', (table) => {
      table.dropIndex(['subPeriodId'])
      table.dropColumn('subPeriodId')
    })

    this.schema.alterTable('Assignment', (table) => {
      table.dropIndex(['subPeriodId'])
      table.dropColumn('subPeriodId')
    })
  }
}
