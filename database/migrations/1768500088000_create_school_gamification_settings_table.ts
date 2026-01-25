import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolGamificationSettings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .unique()
      table.integer('pointsToMoneyRate').notNullable().defaultTo(100)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
