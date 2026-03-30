import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createAttendanceFixtures } from '#tests/helpers/attendance_fixtures'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Class student status endpoint', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login', async ({ client, assert }) => {
    const response = await client
      .get(`/api/v1/classes/${FAKE_UUID}/student-status`)
      .qs({ subjectId: FAKE_UUID, courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .redirects(0)
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })

  test('returns 404 for non-existent class', async ({ client }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client
      .get(`/api/v1/classes/${FAKE_UUID}/student-status`)
      .qs({ subjectId: FAKE_UUID, courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .loginAs(user)
    response.assertStatus(404)
  })

  test('does not fail by grade when all evaluative max scores are zero', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    await Assignment.create({
      name: 'Caderno de desenho',
      description: null,
      dueDate: DateTime.now().plus({ days: 2 }),
      grade: 0,
      teacherHasClassId: fixtures.teacherHasClass.id,
      academicPeriodId: fixtures.academicPeriod.id,
    })

    const response = await client
      .get(`/api/v1/classes/${fixtures.classEntity.id}/student-status`)
      .qs({
        subjectId: fixtures.subject.id,
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    const body = response.body() as Array<{
      id: string
      status: string
      pointsUntilPass: number | null
      maxPossibleGrade: number
    }>

    assert.isAtLeast(body.length, 1)
    const firstStudent = body[0]
    assert.exists(firstStudent)
    assert.notEqual(firstStudent?.status, 'FAILED')
    assert.equal(firstStudent?.status, 'IN_PROGRESS')
    assert.equal(firstStudent?.pointsUntilPass, null)
    assert.equal(firstStudent?.maxPossibleGrade, 0)
  })
})
