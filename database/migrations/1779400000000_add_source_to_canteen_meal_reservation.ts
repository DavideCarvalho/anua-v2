import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenMealReservation'

  async up() {
    await this.db.rawQuery(`
      DO $$ BEGIN
        CREATE TYPE "MealReservationSource" AS ENUM ('RECURRENCE', 'SPOT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('source', '"MealReservationSource"').notNullable().defaultTo('SPOT')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('source')
    })
    await this.db.rawQuery('DROP TYPE IF EXISTS "MealReservationSource" CASCADE')
  }
}
