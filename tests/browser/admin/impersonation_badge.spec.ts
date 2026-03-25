import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import { createTestRoles } from '#tests/helpers/escola_auth'

test.group('Impersonation badge (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('allows typing in the impersonation search input', async ({
    visit,
    browserContext,
    assert,
  }) => {
    await createTestRoles()

    const superAdminRole = await Role.findByOrFail('name', 'SUPER_ADMIN')
    const schoolDirectorRole = await Role.findByOrFail('name', 'SCHOOL_DIRECTOR')

    const superAdminUser = await User.create({
      name: 'Super Admin',
      slug: `super-admin-${Date.now()}`,
      email: `super-admin-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: superAdminRole.id,
    })

    await User.create({
      name: 'Usuario para Impersonacao',
      slug: `impersonacao-${Date.now()}`,
      email: `impersonacao-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: schoolDirectorRole.id,
    })

    await browserContext.loginAs(superAdminUser)

    const page = await visit('/admin')

    await page.click('button:has-text("Personificar")')
    await page.click('input#search')
    await page.keyboard.type('usuario')

    const value = await page.locator('input#search').inputValue()
    assert.equal(value, 'usuario')
  })
})
