import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'

import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createAttendanceAuthFixtures } from '#tests/helpers/attendance_auth_fixtures'

test.group('Academic period dashboard by slug', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('returns dashboard metrics without relation errors', async ({ client }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/academic-periods/by-slug/${fixtures.academicPeriod.slug}/dashboard`)
      .loginAs(user)

    response.assertStatus(200)
  })
})
