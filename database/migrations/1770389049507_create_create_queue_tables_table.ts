import { BaseSchema } from '@adonisjs/lucid/schema'
import { QueueSchemaService } from '@boringnode/queue'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  async up() {
    const knex = db.connection().getWriteClient()
    const schemaService = new QueueSchemaService(knex)

    // Drop old tables if exist (schema changed in v0.4.0)
    await schemaService.dropSchedulesTable('queue_schedules')
    await schemaService.dropJobsTable('queue_jobs')

    // Create with new schema
    await schemaService.createJobsTable('queue_jobs')
    await schemaService.createSchedulesTable('queue_schedules')
  }

  async down() {
    const knex = db.connection().getWriteClient()
    const schemaService = new QueueSchemaService(knex)

    await schemaService.dropSchedulesTable('queue_schedules')
    await schemaService.dropJobsTable('queue_jobs')
  }
}
