import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Occurrences list API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client }) => {
    const response = await client.get('/api/v1/occurrences').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('returns 200 with data for authenticated user', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get('/api/v1/occurrences').loginAs(user)
    response.assertStatus(200)
    const body = response.body()
    assert.property(body, 'data')
    assert.isArray(body.data)
    assert.property(body, 'metadata')
  })

  test('returns empty data when school has no occurrences', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get('/api/v1/occurrences').loginAs(user)
    response.assertStatus(200)
    assert.deepEqual(response.body().data, [])
  })
})

test.group('Occurrences create API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/occurrences')
      .json({
        studentId: FAKE_UUID,
        teacherHasClassId: FAKE_UUID,
        type: 'BEHAVIOR',
        text: 'Test occurrence',
        date: '2025-01-15',
      })
      .redirects(0)
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })
})
