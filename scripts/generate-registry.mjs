import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const REGISTRY_PATH = '.adonisjs/client/registry/index.ts'
const TIMEOUT_MS = 30000

async function generateRegistry() {
  if (existsSync(REGISTRY_PATH)) {
    console.log('Registry already exists, skipping generation')
    return
  }

  console.log('Starting dev server to generate registry...')

  const devServer = spawn('node', ['ace', 'serve'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  })

  let output = ''
  devServer.stdout?.on('data', (data) => {
    output += data.toString()
    if (data.toString().includes('tuyau: created api client registry')) {
      console.log('Registry generated successfully!')
      if (devServer.pid) process.kill(-devServer.pid, 'SIGTERM')
      process.exit(0)
    }
  })

  devServer.stderr?.on('data', (data) => {
    output += data.toString()
  })

  const startTime = Date.now()

  while (!existsSync(REGISTRY_PATH)) {
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.error('Timeout waiting for registry generation')
      console.error('Dev server output:', output)
      if (devServer.pid) process.kill(-devServer.pid, 'SIGTERM')
      process.exit(1)
    }
    await sleep(500)
  }

  console.log('Registry file found, stopping dev server...')
  if (devServer.pid) process.kill(-devServer.pid, 'SIGTERM')
  await sleep(1000)
  process.exit(0)
}

generateRegistry().catch((error) => {
  console.error('Failed to generate registry:', error)
  process.exit(1)
})
