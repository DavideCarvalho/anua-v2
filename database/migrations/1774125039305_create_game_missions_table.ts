import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.string('location', 50).notNullable()
      table.string('difficulty', 20).defaultTo('normal')

      table.integer('required_level').defaultTo(1)
      table.specificType('required_class', 'varchar(50)[]').defaultTo('{}')

      table.integer('duration_minutes').notNullable()
      table.integer('energy_cost').notNullable()

      table.integer('gold_reward_min').defaultTo(0)
      table.integer('gold_reward_max').defaultTo(0)
      table.integer('experience_reward').defaultTo(0)
      table.jsonb('item_drop_chance').defaultTo({})

      table.boolean('is_active').defaultTo(true)
      table.time('available_from').nullable()
      table.time('available_until').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX idx_game_missions_location ON game_missions(location);
        CREATE INDEX idx_game_missions_difficulty ON game_missions(difficulty);
      `)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
