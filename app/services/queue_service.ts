import { QueueManager } from '@boringnode/queue'
import queueConfig from '#config/queue'

// @boringnode/queue alpha version has unstable types
// Using type assertion until types are stabilized
type QueueManagerInstance = ReturnType<typeof createQueueManager>

function createQueueManager() {
  // @ts-expect-error - alpha version type issue
  return new QueueManager(queueConfig)
}

let queueManager: QueueManagerInstance | null = null

/**
 * Get the queue manager instance (singleton)
 */
export async function getQueueManager(): Promise<QueueManagerInstance> {
  if (!queueManager) {
    queueManager = createQueueManager()
    await queueManager.init()
  }
  return queueManager
}

/**
 * Shutdown the queue manager
 */
export async function shutdownQueueManager(): Promise<void> {
  if (queueManager) {
    await queueManager.shutdown()
    queueManager = null
  }
}

export { queueManager }
