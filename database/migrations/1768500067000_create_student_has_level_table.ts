import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasLevel'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('levelAssignedToCourseAcademicPeriodId')
        .notNullable()
        .references('id')
        .inTable('LevelAssignedToCourseHasAcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('scholarshipId')
        .nullable()
        .references('id')
        .inTable('Scholarship')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('academicPeriodId').nullable()
      table
        .text('levelId')
        .nullable()
        .references('id')
        .inTable('Level')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('classId')
        .nullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('contractId')
        .nullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('contractUrl').nullable()
      table.text('paymentMethod').nullable()
      table.integer('enrollmentInstallments').nullable()
      table.integer('installments').nullable()
      table.integer('paymentDay').nullable()
      table.text('docusealSubmissionId').nullable()
      table.specificType('docusealSignatureStatus', '"SignatureStatus"').nullable()
      table.date('documentSignedAt').nullable()
      table.text('enrollmentPaymentId').nullable()
      table.text('signedContractFilePath').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
