import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_levels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table
        .string('level_assigned_to_course_academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('level_assigned_to_course_has_academic_periods')
      table.uuid('scholarship_id').nullable().references('id').inTable('scholarships')
      table.string('academic_period_id', 12).nullable()
      table.string('level_id', 12).nullable()
      table.string('class_id', 12).nullable().references('id').inTable('classes')
      table.string('contract_id', 12).nullable().references('id').inTable('contracts')
      table.string('contract_url').nullable()
      table.enum('payment_method', ['BOLETO', 'CREDIT_CARD', 'PIX']).nullable()
      table.integer('enrollment_installments').nullable()
      table.integer('installments').nullable()
      table.integer('payment_day').nullable() // 1-31
      table.string('docuseal_submission_id').nullable()
      table
        .enum('docuseal_signature_status', ['PENDING', 'SIGNED', 'DECLINED', 'EXPIRED'])
        .nullable()
      table.date('document_signed_at').nullable()
      table.string('enrollment_payment_id').nullable()
      table.string('signed_contract_file_path').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(
        ['level_assigned_to_course_academic_period_id'],
        'idx_student_level_course_period'
      )
      table.index(['scholarship_id'])
      table.index(['class_id'])
      table.index(['contract_id'])
      table.index(['docuseal_signature_status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
