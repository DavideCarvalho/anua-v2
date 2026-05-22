import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentFarm'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .unique()
      table.integer('seeds').notNullable().defaultTo(0)
      table.jsonb('plots').notNullable().defaultTo(JSON.stringify([]))
      table.integer('pointsEarnedToday').notNullable().defaultTo(0)
      table.date('pointsResetAt').nullable()
      table.timestamp('lastDailyAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
