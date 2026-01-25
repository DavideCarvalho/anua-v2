import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'responsible_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('responsible_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('document_type').notNullable() // RG, CPF, CNH, etc.
      table.string('document_number').notNullable()
      table.string('issuing_agency').nullable() // Órgão expedidor
      table.date('issue_date').nullable() // Data de expedição
      table.date('expiry_date').nullable() // Data de vencimento
      table.string('file_path').nullable() // Caminho do arquivo
      table.boolean('verified').defaultTo(false) // Se foi verificado
      table.text('observations').nullable() // Observações

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['responsible_id'])
      table.index(['document_type'])
      table.unique(['responsible_id', 'document_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
