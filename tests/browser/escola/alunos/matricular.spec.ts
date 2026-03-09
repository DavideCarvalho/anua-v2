/// <reference lib="dom" />

import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

test.group('Matricular aluno - E2E (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('loads enrollment page and displays all steps', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createEnrollmentFixtures(school)

    await browserContext.loginAs(user)

    // Navigate to enrollment page
    const page = await visit('/escola/administrativo/matriculas/nova')
    await page.waitForTimeout(2000)

    // Verify the page loaded
    await page.assertExists('text=Período Letivo')

    // Verify academic period selector exists
    await page.assertExists('[data-slot="select-trigger"]')

    // Verify all sidebar steps are visible
    await page.assertExists('text=Aluno')
    await page.assertExists('text=Responsáveis')
    await page.assertExists('text=Endereço')
    await page.assertExists('text=Informações Médicas')
    await page.assertExists('text=Cobrança')
    await page.assertExists('text=Revisão')

    // Verify navigation buttons
    await page.assertExists('button:has-text("Próximo")')
    await page.assertExists('button:has-text("Cancelar")')

    // Verify "Voltar para matrículas" link exists
    await page.assertExists('text=Voltar para matrículas')
  })

  test('redirects unauthenticated users to login', async ({ visit }) => {
    const page = await visit('/escola/administrativo/matriculas/nova')
    await page.assertPath('/login')
  })

  test('navigates from students list to enrollment page', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createEnrollmentFixtures(school)

    await browserContext.loginAs(user)

    // Step 1: Go to students list
    const page = await visit('/escola/administrativo/alunos')
    await page.waitForTimeout(2000)

    // Verify we're on the students page
    await page.assertPathContains('alunos')

    // Step 2: Navigate to enrollment page
    await page.goto('/escola/administrativo/matriculas/nova')
    await page.waitForTimeout(2000)

    // Verify enrollment page loaded
    await page.assertExists('text=Período Letivo')
  })
})
