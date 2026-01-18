import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('student_id').notNullable().references('id').inTable('students').onDelete('CASCADE')
      table.string('file_name').notNullable()
      table.text('file_url').notNullable()
      table.string('mime_type').notNullable()
      table.integer('size').notNullable()

      table.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING')

      table.uuid('reviewed_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('reviewed_at', { useTz: true }).nullable()
      table.text('rejection_reason').nullable()

      table.uuid('contract_document_id').notNullable().references('id').inTable('contract_documents').onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['student_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
