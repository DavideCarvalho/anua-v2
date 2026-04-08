import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Escola simplified layout across modules (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('uses simplified layout in alunos when mode is simple', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.click('button:has-text("Visão simplificada")')
    await page.click('a:has-text("Alunos")')

    await page.assertPathContains('/escola/administrativo/alunos')
    await page.assertExists('[data-testid="escola-simplified-layout"]')
    await page.assertExists('[data-testid="simplified-primary-actions"]')
    await page.assertExists('[data-testid="simplified-basic-list"]')
  })
})
