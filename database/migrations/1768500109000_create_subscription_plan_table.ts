import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SubscriptionPlan'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.specificType('tier', '"SubscriptionTier"').notNullable()
      table.text('description').nullable()
      table.integer('monthlyPrice').notNullable()
      table.integer('annualPrice').nullable()
      table.integer('maxStudents').nullable()
      table.integer('maxTeachers').nullable()
      table.integer('maxSchoolsInChain').nullable()
      table.jsonb('features').notNullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
