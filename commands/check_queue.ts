import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

export default class CheckQueue extends BaseCommand {
  static commandName = 'check:queue'
  static description = 'Check queue_jobs table'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const jobs = await db.from('queue_jobs').select('*')
    this.logger.info(`Jobs found: ${jobs.length}`)
    for (const j of jobs) {
      this.logger.info(JSON.stringify({ id: j.id, queue: j.queue, status: j.status, score: j.score }))
    }
  }
}
