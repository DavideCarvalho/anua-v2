import { QueueManager } from '@boringnode/queue'
import queueConfig from '#config/queue'

let initialized = false

/**
 * Get the queue manager instance (singleton from @boringnode/queue)
 */
export async function getQueueManager() {
  if (!initialized) {
    await QueueManager.init(queueConfig)
    initialized = true
  }
  return QueueManager
}

/**
 * Shutdown the queue manager
 */
export async function shutdownQueueManager(): Promise<void> {
  if (initialized) {
    await QueueManager.destroy()
    initialized = false
  }
}
