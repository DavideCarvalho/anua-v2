import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Leaderboard'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.specificType('type', '"LeaderboardType"').notNullable()
      table.specificType('period', '"RecurrencePeriod"').notNullable()
      table.date('startDate').notNullable()
      table.date('endDate').notNullable()
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('classId')
        .nullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('subjectId')
        .nullable()
        .references('id')
        .inTable('Subject')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
