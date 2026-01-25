import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentGamification'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
        .unique()
      table.integer('totalPoints').notNullable().defaultTo(0)
      table.integer('currentLevel').notNullable().defaultTo(1)
      table.integer('levelProgress').notNullable().defaultTo(0)
      table.integer('streak').notNullable().defaultTo(0)
      table.integer('longestStreak').notNullable().defaultTo(0)
      table.timestamp('lastActivityAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
