import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

test.group('Matricular aluno - E2E (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('loads enrollment page and navigates through steps', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createEnrollmentFixtures(school)

    await browserContext.loginAs(user)
    const page = await visit('/escola/administrativo/matriculas/nova')

    // Wait for the enrollment page to load
    await page.waitForSelector('text=Período Letivo', { timeout: 10000 })

    // Verify the page has the academic period selector
    await page.assertExists('[data-slot="select-trigger"]')

    // Verify sidebar steps are visible
    await page.assertExists('text=Aluno')
    await page.assertExists('text=Responsáveis')
    await page.assertExists('text=Endereço')
    await page.assertExists('text=Informações Médicas')
    await page.assertExists('text=Cobrança')
    await page.assertExists('text=Revisão')

    // Verify navigation buttons exist
    await page.assertExists('button:has-text("Próximo")')
    await page.assertExists('button:has-text("Cancelar")')
  })

  test('redirects unauthenticated users to login', async ({ visit }) => {
    const page = await visit('/escola/administrativo/matriculas/nova')
    await page.assertPath('/login')
  })
})
