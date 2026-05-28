import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Student from '#models/student'
import { ensureSelfResponsibleLink } from '#services/self_responsible_link'

export interface BackfillStats {
  processed: number
  created: number
}

/** Lógica isolada pra ser testável sem bootar o Ace. */
export async function backfillSelfResponsibleLinks(): Promise<BackfillStats> {
  const stats: BackfillStats = { processed: 0, created: 0 }
  const students = await Student.query().where('isSelfResponsible', true)
  for (const student of students) {
    stats.processed++
    const created = await ensureSelfResponsibleLink(student)
    if (created) stats.created++
  }
  return stats
}

export default class BackfillSelfResponsibleLinks extends BaseCommand {
  static commandName = 'backfill:self-responsible-links'
  static description =
    'Cria self-link em StudentHasResponsible pra alunos autorresponsáveis sem vínculo'
  static options: CommandOptions = { startApp: true }

  async run() {
    const stats = await backfillSelfResponsibleLinks()
    this.logger.info(
      `Backfill concluído: ${stats.processed} autorresponsáveis processados, ${stats.created} self-links criados.`
    )
  }
}
