import { test } from '@japa/runner'
import '@japa/api-client'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Students API (escola/alunos)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client }) => {
    const response = await client.get('/api/v1/students').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('returns 200 with paginated data for authenticated user', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get('/api/v1/students').loginAs(user)
    response.assertStatus(200)
    const body = response.body()
    assert.property(body, 'data')
    assert.isArray(body.data)
    assert.property(body, 'metadata')
    assert.property(body.metadata, 'total')
    assert.property(body.metadata, 'perPage')
  })

  test('returns 200 with empty data when school has no students', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get('/api/v1/students').loginAs(user)
    response.assertStatus(200)
    assert.deepEqual(response.body().data, [])
  })

  test('accepts pagination params', async ({ client }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get('/api/v1/students').qs({ page: 1, limit: 10 }).loginAs(user)
    response.assertStatus(200)
  })

  test('returns 404 for non-existent student', async ({ client }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client.get(`/api/v1/students/${FAKE_UUID}`).loginAs(user)
    response.assertStatus(404)
  })
})
