import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PaymentSettings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.integer('pricePerStudent').notNullable()
      table.integer('trialDays').notNullable().defaultTo(30)
      table.integer('discount').notNullable().defaultTo(0)
      table.float('platformFeePercentage', 8).notNullable().defaultTo(5.0)
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
        .unique()
      table
        .text('schoolChainId')
        .nullable()
        .references('id')
        .inTable('SchoolChain')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
        .unique()
      table.index(['schoolChainId'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
