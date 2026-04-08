import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Escola dashboard view mode (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('switches to simple mode and shows the 6 quick actions', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')

    await page.assertExists('h1:has-text("O que você quer fazer agora?")')
    await page.assertExists('a:has-text("Alunos")')
    await page.assertExists('a:has-text("Turmas")')
    await page.assertExists('a:has-text("Calendário")')
    await page.assertExists('a:has-text("Financeiro")')
    await page.assertExists('a:has-text("Cantina")')
    await page.assertExists('a:has-text("Comunicados")')
  })

  test('persists selected view mode after reload', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.reload()

    await page.assertExists('h1:has-text("O que você quer fazer agora?")')
  })

  test('navigates to alunos from quick actions hub', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.click('a:has-text("Alunos")')

    await page.assertPathContains('/escola/administrativo/alunos')
  })

  test('returns to full mode and shows dashboard tabs', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.click('button:has-text("Visão simplificada")')
    await page.click('button:has-text("Visão completa")')

    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertExists('button:has-text("Administrativo")')
  })
})
