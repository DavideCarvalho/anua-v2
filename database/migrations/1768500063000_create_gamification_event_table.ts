import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'GamificationEvent'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('type').notNullable()
      table.text('entityType').notNullable()
      table.text('entityId').notNullable()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.jsonb('metadata').notNullable()
      table.boolean('processed').notNullable().defaultTo(false)
      table.timestamp('processedAt').nullable()
      table.text('error').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.index(['createdAt'])
      table.index(['processed'])
      table.index(['studentId'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
