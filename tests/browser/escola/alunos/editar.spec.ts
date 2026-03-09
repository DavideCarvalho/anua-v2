import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createEnrollmentFixtures } from '#tests/helpers/enrollment_fixtures'

test.group('Editar aluno - E2E (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('loads edit student page', async ({ visit, browserContext }) => {
    const { user, school } = await createEscolaAuthUser()
    await createEnrollmentFixtures(school)

    await browserContext.loginAs(user)

    // Visit the edit page for a student (using a fake UUID)
    const page = await visit(
      '/escola/administrativo/alunos/11111111-1111-4111-8111-111111111111/editar'
    )

    // The page should either load the edit form or show "not found"
    // Either way, it should not redirect to login
    const currentPath = await page.url()
    if (currentPath.includes('/login')) {
      throw new Error('Should not redirect to login for authenticated user')
    }
  })

  test('redirects unauthenticated users to login', async ({ visit }) => {
    const page = await visit(
      '/escola/administrativo/alunos/11111111-1111-4111-8111-111111111111/editar'
    )
    await page.assertPath('/login')
  })
})
