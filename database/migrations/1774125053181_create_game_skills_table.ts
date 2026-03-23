import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_skills'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('class', 20).notNullable()
      table.string('branch', 50).notNullable()

      table.integer('required_level').defaultTo(1)
      table.uuid('required_skill_id').references('id').inTable('game_skills').nullable()

      table.string('effect_type', 50).notNullable()
      table.decimal('effect_value', 10, 2).nullable()

      table.string('icon', 100).nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_skills_class ON game_skills(class);
        CREATE INDEX idx_game_skills_branch ON game_skills(branch);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
