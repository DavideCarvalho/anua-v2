import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Role from '#models/role'

test.group('Dashboard page (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ visit, route }) => {
    const page = await visit(route('web.dashboard'))
    await page.assertPath('/login')
  })

  test('redirects ADMIN user to /admin', async ({ visit, browserContext, route }) => {
    const role = await Role.create({ name: 'ADMIN' })
    const user = await User.create({
      name: 'Admin User',
      slug: `admin-${Date.now()}`,
      email: `admin-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })

    await browserContext.loginAs(user)
    const page = await visit(route('web.dashboard'))
    await page.assertPath('/admin')
  })

  test('redirects DIRECTOR with school to /escola', async ({ visit, browserContext, route }) => {
    const { createEscolaAuthUser } = await import('#tests/helpers/escola_auth')
    const { user } = await createEscolaAuthUser()

    await browserContext.loginAs(user)
    const page = await visit(route('web.dashboard'))
    await page.assertPath('/escola')
  })
})
