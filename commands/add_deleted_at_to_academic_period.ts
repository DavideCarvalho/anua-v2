import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

export default class AddDeletedAtToAcademicPeriod extends BaseCommand {
  static commandName = 'add:deleted-at-to-academic-period'
  static description = 'Add deletedAt column to AcademicPeriod table'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      await db.rawQuery(
        'ALTER TABLE "AcademicPeriod" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL'
      )
      this.logger.success('Column deletedAt added to AcademicPeriod!')
    } catch (error) {
      this.logger.error('Failed to add column: ' + error.message)
    }
  }
}
