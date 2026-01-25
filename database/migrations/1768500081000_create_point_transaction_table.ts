import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PointTransaction'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentGamificationId')
        .notNullable()
        .references('id')
        .inTable('StudentGamification')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('points').notNullable()
      table.integer('balanceAfter').notNullable()
      table.specificType('type', '"TransactionType"').notNullable()
      table.text('reason').nullable()
      table.text('relatedEntityType').nullable()
      table.text('relatedEntityId').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.index(['createdAt'])
      table.index(['studentGamificationId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
