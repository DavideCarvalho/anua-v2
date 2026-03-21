import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_points_conversions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.uuid('student_id').references('id').inTable('students').notNullable()
      table.integer('points_spent').notNullable()
      table.integer('gold_received').notNullable()
      table.integer('rate').notNullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_points_conversions_student ON game_points_conversions(student_id);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
