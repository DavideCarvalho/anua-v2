import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_character_missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('character_id')
        .references('id')
        .inTable('game_characters')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('mission_id').references('id').inTable('game_missions').notNullable()

      table.string('status', 20).defaultTo('in_progress')
      table.timestamp('started_at').notNullable()
      table.timestamp('completes_at').notNullable()

      table.integer('gold_earned').nullable()
      table.integer('experience_earned').nullable()
      table.jsonb('items_earned').nullable()

      table.timestamp('created_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_character_missions_character ON game_character_missions(character_id);
        CREATE INDEX idx_game_character_missions_status ON game_character_missions(status);
        CREATE INDEX idx_game_character_missions_completes ON game_character_missions(completes_at);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
