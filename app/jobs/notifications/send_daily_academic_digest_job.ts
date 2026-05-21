import { Job } from '@adonisjs/queue'
import { sendAcademicDigest } from '#start/jobs/send_academic_digest'

interface Payload {
  dryRun?: boolean
}

/**
 * Email diário (19h BR) com provas e atividades do dia seguinte pros
 * responsáveis pedagógicos e alunos autorresponsáveis.
 */
export default class SendDailyAcademicDigestJob extends Job<Payload> {
  static readonly jobName = 'SendDailyAcademicDigestJob'

  static options = {
    queue: 'notifications',
    maxRetries: 2,
    removeOnComplete: { count: 60 },
    removeOnFail: { count: 60 },
  }

  async execute(): Promise<void> {
    await sendAcademicDigest({ kind: 'daily', dryRun: this.payload?.dryRun ?? false })
  }
}
