import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(
      `CREATE INDEX IF NOT EXISTS idx_achievement_criteria_event_type ON "Achievement" ((criteria->>'eventType'))`
    )
  }

  async down() {
    await this.db.rawQuery(`DROP INDEX IF EXISTS idx_achievement_criteria_event_type`)
  }
}
