import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenMealReservation'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('mealId')
        .notNullable()
        .references('id')
        .inTable('CanteenMeal')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('status', '"MealReservationStatus"').notNullable().defaultTo('RESERVED')
      table.timestamp('reservedAt').notNullable().defaultTo(this.now())
      table.timestamp('servedAt').nullable()
      table.timestamp('cancelledAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['mealId', 'studentId'])
      table.index(['mealId'])
      table.index(['status'])
      table.index(['studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
