import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUserByRole } from '#tests/helpers/escola_auth'

test.group('Escola dashboard tabs (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated users to login', async ({ visit }) => {
    const page = await visit('/escola')
    await page.assertPath('/login')
  })

  test('shows only pedagogical dashboard for SCHOOL_TEACHER', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_TEACHER')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')
    await page.assertNotExists('button:has-text("Pedagógico")')
    await page.assertNotExists('button:has-text("Administrativo")')
    await page.assertNotExists('button:has-text("Financeiro")')
  })

  test('shows pedagogical and administrative tabs for SCHOOL_ADMINISTRATIVE', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_ADMINISTRATIVE')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')
    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertExists('button:has-text("Administrativo")')
    await page.assertNotExists('button:has-text("Financeiro")')
  })

  test('shows all tabs for SCHOOL_ADMIN', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_ADMIN')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')
    await page.assertExists('button:has-text("Pedagógico")')
    await page.assertExists('button:has-text("Administrativo")')
    await page.assertExists('button:has-text("Financeiro")')
  })

  test('allows SCHOOL_ADMIN to switch between dashboard tabs', async ({
    visit,
    browserContext,
  }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_ADMIN')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')

    await page.assertExists('text=Ações Pedagógicas')

    await page.click('button:has-text("Administrativo")')
    await page.assertExists('text=Ações Administrativas')

    await page.click('button:has-text("Financeiro")')
    await page.assertExists('text=Ações Financeiras')
    await page.assertExists('button:has-text("Mostrar valores")')
  })

  test('shows financial tab for SCHOOL_DIRECTOR', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_DIRECTOR')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')
    await page.assertExists('button:has-text("Financeiro")')
  })

  test('shows financial tab for SCHOOL_CHAIN_DIRECTOR', async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_CHAIN_DIRECTOR')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    await page.assertPath('/escola')
    await page.assertExists('button:has-text("Financeiro")')
  })

  test('does not log React hydration mismatch on escola dashboard', async ({
    visit,
    browserContext,
    assert,
  }) => {
    const { user } = await createEscolaAuthUserByRole('SCHOOL_DIRECTOR')
    await browserContext.loginAs(user)

    const page = await visit('/escola')
    const consoleErrors: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    await page.assertPath('/escola')
    await page.waitForTimeout(1000)

    assert.notInclude(
      consoleErrors.join('\n'),
      "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"
    )
  })
})
