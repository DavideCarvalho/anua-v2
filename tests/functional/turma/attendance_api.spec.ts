import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Attendance class students API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client, assert }) => {
    const response = await client
      .get(`/api/v1/attendance/class/${FAKE_UUID}/students`)
      .qs({ courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .redirects(0)
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })

  test('returns 404 for non-existent class', async ({ client }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client
      .get(`/api/v1/attendance/class/${FAKE_UUID}/students`)
      .qs({ courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .loginAs(user)
    response.assertStatus(404)
  })
})

test.group('Attendance batch create API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/attendance/batch')
      .json({
        classId: FAKE_UUID,
        academicPeriodId: FAKE_UUID,
        subjectId: FAKE_UUID,
        dates: ['2025-01-15'],
        attendances: [],
      })
      .redirects(0)
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })
})
