import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_partners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('cnpj').notNullable().unique()
      table.string('email').nullable()
      table.string('phone').nullable()
      table.string('contact_name').nullable()
      table.float('discount_percentage').defaultTo(0)
      table.date('partnership_start_date').notNullable()
      table.date('partnership_end_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['cnpj'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
