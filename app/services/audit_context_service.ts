/**
 * Simple service to store audit context for background jobs.
 * Since jobs run sequentially in workers, a simple global variable works fine.
 */

interface AuditContext {
  userId?: string
  userName?: string
  source?: string
}

let currentContext: AuditContext | null = null

/**
 * Set the audit context for the current job.
 * Call this at the start of your job before doing any auditable operations.
 */
export function setAuditContext(context: AuditContext | null): void {
  currentContext = context
}

/**
 * Get the current audit context.
 * Returns null if no context is set.
 */
export function getAuditContext(): AuditContext | null {
  return currentContext
}

/**
 * Clear the audit context.
 * Call this at the end of your job to clean up.
 */
export function clearAuditContext(): void {
  currentContext = null
}

/**
 * Helper to run a function with a specific audit context.
 * Automatically clears the context when done.
 */
export async function withAuditContext<T>(context: AuditContext, fn: () => Promise<T>): Promise<T> {
  setAuditContext(context)
  try {
    return await fn()
  } finally {
    clearAuditContext()
  }
}
