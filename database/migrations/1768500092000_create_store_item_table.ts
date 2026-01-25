import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StoreItem'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('description').notNullable()
      table.integer('price').notNullable()
      table.specificType('paymentMode', '"PaymentMode"').notNullable()
      table.integer('pointsToMoneyRate').notNullable().defaultTo(100)
      table.integer('minPointsPercentage').nullable()
      table.integer('maxPointsPercentage').nullable()
      table.specificType('category', '"StoreCategory"').notNullable()
      table.text('imageUrl').nullable()
      table.integer('totalStock').nullable()
      table.integer('reservedStock').notNullable().defaultTo(0)
      table.integer('maxPerStudent').nullable()
      table.specificType('maxPerStudentPeriod', '"RecurrencePeriod"').nullable()
      table.integer('preparationTimeMinutes').nullable()
      table.boolean('requiresApproval').notNullable().defaultTo(true)
      table.text('pickupLocation').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('canteenItemId')
        .nullable()
        .references('id')
        .inTable('CanteenItem')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
        .unique()
      table.date('availableFrom').nullable()
      table.date('availableUntil').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['category'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
