import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreOrder'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('orderNumber').notNullable().unique()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.specificType('status', '"OrderStatus"').notNullable().defaultTo('PENDING_PAYMENT')
      table.integer('totalPrice').notNullable()
      table.integer('totalPoints').notNullable()
      table.integer('totalMoney').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('paidAt').nullable()
      table.timestamp('approvedAt').nullable()
      table.timestamp('preparingAt').nullable()
      table.timestamp('readyAt').nullable()
      table.timestamp('deliveredAt').nullable()
      table.timestamp('canceledAt').nullable()
      table.timestamp('estimatedReadyAt').nullable()
      table.text('studentNotes').nullable()
      table.text('internalNotes').nullable()
      table.text('cancellationReason').nullable()
      table
        .text('approvedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('preparedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('deliveredBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('updatedAt').notNullable()
      table.index(['createdAt'])
      table.index(['schoolId'])
      table.index(['status'])
      table.index(['studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
