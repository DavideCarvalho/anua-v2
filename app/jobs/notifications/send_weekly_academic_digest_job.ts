import { Job } from '@adonisjs/queue'
import { sendAcademicDigest } from '#start/jobs/send_academic_digest'

interface Payload {
  dryRun?: boolean
}

/**
 * Email semanal (segunda 07h BR) com provas e atividades dos próximos 7 dias
 * pros responsáveis pedagógicos e alunos autorresponsáveis.
 */
export default class SendWeeklyAcademicDigestJob extends Job<Payload> {
  static readonly jobName = 'SendWeeklyAcademicDigestJob'

  static options = {
    queue: 'notifications',
    maxRetries: 2,
    removeOnComplete: { count: 12 },
    removeOnFail: { count: 12 },
  }

  async execute(): Promise<void> {
    await sendAcademicDigest({ kind: 'weekly', dryRun: this.payload?.dryRun ?? false })
  }
}
