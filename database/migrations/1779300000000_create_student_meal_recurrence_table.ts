import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentMealRecurrence'

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
      table
        .text('canteenId')
        .notNullable()
        .references('id')
        .inTable('Canteen')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.integer('weekDay').notNullable() // 1=Segunda ... 5=Sexta
      table.specificType('mealType', '"MealType"').notNullable()
      table
        .text('canteenMealId')
        .nullable()
        .references('id')
        .inTable('CanteenMeal')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.unique(['studentId', 'canteenId', 'weekDay', 'mealType'])
      table.index(['studentId'])
      table.index(['canteenId'])
      table.index(['weekDay', 'mealType'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
