import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'LeaderboardEntry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('leaderboardId')
        .notNullable()
        .references('id')
        .inTable('Leaderboard')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('score').notNullable()
      table.integer('rank').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['leaderboardId', 'studentId'])
      table.index(['leaderboardId', 'rank'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
