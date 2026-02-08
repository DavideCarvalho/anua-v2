import { ApplicationService } from '@adonisjs/core/types'
import { QueueManager as QM } from '@boringnode/queue'
import queueConfig from '#config/queue'

export class QueueManager {
  async dispatch(job: any, payload?: any) {
    if (payload) {
      return job.dispatch(payload)
    }
    return job.dispatch()
  }
}

export default class QueueProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    await QM.init(queueConfig)

    this.app.container.singleton(QueueManager, () => {
      return new QueueManager()
    })
  }

  async shutdown() {
    await QM.destroy()
  }
}
