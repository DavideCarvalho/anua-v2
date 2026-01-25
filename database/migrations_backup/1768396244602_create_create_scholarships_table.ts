import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'scholarships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')
      table.uuid('school_partner_id').nullable().references('id').inTable('school_partners')
      table.string('name').notNullable()
      table.integer('enrollment_discount_percentage').defaultTo(0)
      table.integer('discount_percentage').defaultTo(0)
      table.enum('type', ['PHILANTHROPIC', 'DISCOUNT', 'COMPANY_PARTNERSHIP', 'FREE']).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.text('description').nullable()
      table.string('code').nullable().unique()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['school_id'])
      table.index(['school_partner_id'])
      table.index(['type'])
      table.index(['is_active'])
      table.index(['code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
