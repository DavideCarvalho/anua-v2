import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`CREATE EXTENSION IF NOT EXISTS postgis;`)
  }

  async down() {
    // Note: Dropping PostGIS would break tables using geography types
  }
}
