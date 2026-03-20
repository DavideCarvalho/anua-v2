import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

test.group('Users API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('creates user when role is provided as role name', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    await Role.firstOrCreate({ name: 'SCHOOL_CANTEEN' }, { name: 'SCHOOL_CANTEEN' })

    const response = await client
      .post('/api/v1/users')
      .loginAs(user)
      .header('Accept', 'application/json')
      .json({
        name: 'dono da loja terceirizada',
        email: `donoloja-${Date.now()}@terceirizada.com`,
        password: 'cxfy7jtlA1!',
        schoolId: school.id,
        roleName: 'SCHOOL_CANTEEN',
      })

    response.assertStatus(201)
    const body = response.body()
    assert.equal(body.role?.name, 'SCHOOL_CANTEEN')
  })

  test('updates user when role is provided as role name', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const teacherRole = await Role.firstOrCreate(
      { name: 'SCHOOL_TEACHER' },
      { name: 'SCHOOL_TEACHER' }
    )
    const canteenRole = await Role.firstOrCreate(
      { name: 'SCHOOL_CANTEEN' },
      { name: 'SCHOOL_CANTEEN' }
    )

    const targetUser = await User.create({
      name: 'Funcionario teste',
      slug: `funcionario-${Date.now()}`,
      email: `funcionario-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: teacherRole.id,
    })

    await UserHasSchool.create({
      userId: targetUser.id,
      schoolId: school.id,
      isDefault: false,
    })

    const response = await client
      .put(`/api/v1/users/${targetUser.id}`)
      .loginAs(user)
      .header('Accept', 'application/json')
      .json({
        roleName: 'SCHOOL_CANTEEN',
      })

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.role?.name, canteenRole.name)
  })

  test('rejects create user payload when only roleId is provided', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const canteenRole = await Role.firstOrCreate(
      { name: 'SCHOOL_CANTEEN' },
      { name: 'SCHOOL_CANTEEN' }
    )

    const response = await client
      .post('/api/v1/users')
      .loginAs(user)
      .header('Accept', 'application/json')
      .json({
        name: 'funcionario legado',
        email: `funcionario-legado-${Date.now()}@example.com`,
        password: 'cxfy7jtlA1!',
        schoolId: school.id,
        roleId: canteenRole.id,
      })

    response.assertStatus(422)
    const body = response.body()
    assert.equal(body?.json?.code ?? body?.code, 'VALIDATION_ERROR')
  })

  test('lists newly created SCHOOL_CANTEEN user in school-employees endpoint', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    await Role.firstOrCreate({ name: 'SCHOOL_CANTEEN' }, { name: 'SCHOOL_CANTEEN' })

    const email = `cantina-${Date.now()}@example.com`

    const createResponse = await client
      .post('/api/v1/users')
      .loginAs(user)
      .header('Accept', 'application/json')
      .json({
        name: 'Responsável cantina novo',
        email,
        password: 'cxfy7jtlA1!',
        schoolId: school.id,
        roleName: 'SCHOOL_CANTEEN',
      })

    createResponse.assertStatus(201)

    const listResponse = await client
      .get('/api/v1/users/school-employees')
      .loginAs(user)
      .header('Accept', 'application/json')
      .qs({ search: email, limit: 10 })

    listResponse.assertStatus(200)
    const body = listResponse.body()
    const found = (body?.json?.data ?? body?.data ?? []).find(
      (item: { email?: string; role?: { name?: string } }) => item.email === email
    )

    assert.isDefined(found)
    assert.equal(found?.role?.name, 'SCHOOL_CANTEEN')
  })
})
