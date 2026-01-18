import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('email', 254).nullable().unique()
      table.string('password').nullable()
      table.string('phone').nullable()
      table.boolean('whatsapp_contact').defaultTo(false)
      table.date('birth_date').nullable()
      table.string('document_type').nullable()
      table.string('document_number').nullable()
      table.string('asaas_customer_id').nullable()
      table.string('image_url').nullable()
      table.boolean('active').defaultTo(true)
      table.timestamp('deleted_at').nullable()
      table.uuid('deleted_by').nullable()
      table.integer('gross_salary').defaultTo(0)

      // Foreign keys (will be added after other tables are created)
      table.uuid('role_id').nullable()
      table.uuid('school_id').nullable()
      table.uuid('school_chain_id').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Indexes
      table.index(['role_id'])
      table.index(['deleted_by'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
