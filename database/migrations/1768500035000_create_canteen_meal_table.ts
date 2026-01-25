import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenMeal'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.specificType('mealType', '"MealType"').notNullable()
      table.text('name').notNullable()
      table.text('description').nullable()
      table.integer('price').notNullable()
      table.integer('maxServings').nullable()
      table.integer('availableServings').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['canteenId', 'date', 'mealType'])
      table.index(['canteenId'])
      table.index(['date'])
      table.index(['mealType'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
