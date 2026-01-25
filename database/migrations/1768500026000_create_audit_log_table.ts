import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AuditLog'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('action').notNullable()
      table.text('entity').notNullable()
      table.text('entityId').notNullable()
      table.jsonb('details').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.index(['entity', 'entityId'])
      table.index(['userId', 'createdAt'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
