import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { apiClient } from '@japa/api-client'
import { browserClient } from '@japa/browser-client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  apiClient(),
  sessionApiClient(app),
  authApiClient(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    async () => {
      const specsWithoutTransaction = await findSpecsWithoutTransaction(app.makePath('tests'))

      if (specsWithoutTransaction.length > 0) {
        const files = specsWithoutTransaction.map((file) => ` - ${file}`).join('\n')
        throw new Error(
          [
            'Found test files without required DB transaction safeguards.',
            'Every *.spec.ts must include beginGlobalTransaction and rollbackGlobalTransaction.',
            files,
          ].join('\n')
        )
      }
    },
  ],
  teardown: [],
}

async function findSpecsWithoutTransaction(rootDir: string): Promise<string[]> {
  const files = await collectSpecFiles(rootDir)
  const missing: string[] = []

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8')
    const hasBegin = content.includes('beginGlobalTransaction')
    const hasRollback = content.includes('rollbackGlobalTransaction')

    if (!hasBegin || !hasRollback) {
      missing.push(filePath.replace(`${rootDir}/`, ''))
    }
  }

  return missing
}

async function collectSpecFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectSpecFiles(fullPath)))
      continue
    }

    if (entry.isFile() && fullPath.endsWith('.spec.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
