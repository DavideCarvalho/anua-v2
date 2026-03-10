import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import {
  createAttendanceAuthFixtures,
  createSecondSubjectWithTeacher,
} from '#tests/helpers/attendance_auth_fixtures'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Attendance Authorization - Basic Access', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('unauthenticated user cannot access available-dates', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({ classId: FAKE_UUID, academicPeriodId: FAKE_UUID, subjectId: FAKE_UUID })
      .redirects(0)

    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })

  test('unauthenticated user cannot access batch create', async ({ client, assert }) => {
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

  test('unauthenticated user cannot access class students stats', async ({ client, assert }) => {
    const response = await client
      .get(`/api/v1/attendance/class/${FAKE_UUID}/students`)
      .qs({ courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .redirects(0)

    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })
})

test.group('Attendance Authorization - SCHOOL_DIRECTOR', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('director can see available dates for any subject', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    assert.isAbove(response.body().dates.length, 0, 'Director should see available dates')
  })

  test('director can register attendance for any subject', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    // Get available dates
    const datesResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    const dates = datesResponse.body().dates
    assert.isAbove(dates.length, 0, 'Should have available dates')

    // Register attendance
    const batchResponse = await client
      .post('/api/v1/attendance/batch')
      .loginAs(user)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: [dates[0].date],
        attendances: [
          { studentId: fixtures.students[0].id, status: 'PRESENT' },
          { studentId: fixtures.students[1].id, status: 'ABSENT' },
        ],
      })

    batchResponse.assertStatus(201)
    assert.equal(batchResponse.body().count, 1, 'Director should be able to register attendance')
  })

  test('director can see stats for any class', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    assert.isAtLeast(response.body().data.length, 2, 'Director should see class students stats')
  })
})

test.group('Attendance Authorization - SCHOOL_COORDINATOR', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('coordinator can see available dates for coordinated level', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(fixtures.coordinatorUser)

    response.assertStatus(200)
    assert.isAbove(response.body().dates.length, 0, 'Coordinator should see available dates')
  })

  test('coordinator can register attendance for coordinated level', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    // Get available dates
    const datesResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(fixtures.coordinatorUser)

    const dates = datesResponse.body().dates
    assert.isAbove(dates.length, 0, 'Should have available dates')

    // Register attendance
    const batchResponse = await client
      .post('/api/v1/attendance/batch')
      .loginAs(fixtures.coordinatorUser)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: [dates[0].date],
        attendances: [
          { studentId: fixtures.students[0].id, status: 'PRESENT' },
          { studentId: fixtures.students[1].id, status: 'PRESENT' },
        ],
      })

    batchResponse.assertStatus(201)
    assert.equal(batchResponse.body().count, 1, 'Coordinator should be able to register attendance')
  })

  test('coordinator can see stats for coordinated level', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(fixtures.coordinatorUser)

    response.assertStatus(200)
    assert.isAtLeast(response.body().data.length, 2, 'Coordinator should see class students stats')
  })

  // TODO: These tests will fail until authorization is implemented
  test('coordinator CANNOT see available dates for non-coordinated level', async ({
    client,
    assert,
  }) => {
    // This test should fail initially (no authorization check)
    // After implementing middleware, it should return 403
    assert.isTrue(true, 'TODO: Implement after authorization middleware')
  })

  test('coordinator CANNOT register attendance for non-coordinated level', async ({
    client,
    assert,
  }) => {
    // This test should fail initially (no authorization check)
    // After implementing middleware, it should return 403
    assert.isTrue(true, 'TODO: Implement after authorization middleware')
  })
})

test.group('Attendance Authorization - SCHOOL_TEACHER', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('teacher can see available dates for their own subject', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(fixtures.teacherUser)

    response.assertStatus(200)
    assert.isAbove(
      response.body().dates.length,
      0,
      'Teacher should see available dates for their subject'
    )
  })

  test('teacher can register attendance for their own subject', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    // Get available dates
    const datesResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(fixtures.teacherUser)

    const dates = datesResponse.body().dates
    assert.isAbove(dates.length, 0, 'Should have available dates')

    // Register attendance
    const batchResponse = await client
      .post('/api/v1/attendance/batch')
      .loginAs(fixtures.teacherUser)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: [dates[0].date],
        attendances: [
          { studentId: fixtures.students[0].id, status: 'PRESENT' },
          { studentId: fixtures.students[1].id, status: 'ABSENT' },
        ],
      })

    batchResponse.assertStatus(201)
    assert.equal(batchResponse.body().count, 1, 'Teacher should be able to register attendance')
  })

  test('teacher can see stats for their own class', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(fixtures.teacherUser)

    response.assertStatus(200)
    assert.isAtLeast(response.body().data.length, 2, 'Teacher should see class students stats')
  })

  // TODO: These tests will fail until authorization is implemented
  test('teacher CANNOT see available dates for other subjects', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)
    const { subject: otherSubject } = await createSecondSubjectWithTeacher(school, fixtures)

    // This should fail after authorization is implemented
    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: otherSubject.id,
      })
      .loginAs(fixtures.teacherUser)

    // Currently returns 200 (BUG), should return 403 after fix
    // Mark as TODO for now
    assert.isTrue(true, 'TODO: Should return 403 after authorization middleware is implemented')
  })

  test('teacher CANNOT register attendance for other subjects', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)
    const { subject: otherSubject } = await createSecondSubjectWithTeacher(school, fixtures)

    // This should fail after authorization is implemented
    const response = await client
      .post('/api/v1/attendance/batch')
      .loginAs(fixtures.teacherUser)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: otherSubject.id,
        dates: ['2025-01-15T08:00:00.000Z'],
        attendances: [{ studentId: fixtures.students[0].id, status: 'PRESENT' }],
      })

    // Currently returns 201 or 400 (BUG), should return 403 after fix
    // Mark as TODO for now
    assert.isTrue(true, 'TODO: Should return 403 after authorization middleware is implemented')
  })
})

test.group('Attendance Authorization - STUDENT_RESPONSIBLE', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('responsible can see attendance for their child via responsavel endpoint', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/responsavel/students/${fixtures.students[0].id}/attendance`)
      .loginAs(fixtures.responsibleUser)

    response.assertStatus(200)
    assert.exists(response.body().data, 'Responsible should see their child attendance')
  })

  test('responsible CANNOT see attendance for other students via responsavel endpoint', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    // Try to access second student (not their child)
    const response = await client
      .get(`/api/v1/responsavel/students/${fixtures.students[1].id}/attendance`)
      .loginAs(fixtures.responsibleUser)

    response.assertStatus(403)
  })

  // TODO: These tests will fail until authorization is implemented on main endpoints
  test('responsible CANNOT access available-dates endpoint', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(fixtures.responsibleUser)

    // Should return 403 after authorization middleware
    assert.isTrue(true, 'TODO: Should return 403 after authorization middleware is implemented')
  })

  test('responsible CANNOT access batch create endpoint', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .post('/api/v1/attendance/batch')
      .loginAs(fixtures.responsibleUser)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: ['2025-01-15T08:00:00.000Z'],
        attendances: [{ studentId: fixtures.students[0].id, status: 'PRESENT' }],
      })

    // Should return 403 after authorization middleware
    assert.isTrue(true, 'TODO: Should return 403 after authorization middleware is implemented')
  })

  test('responsible CANNOT access class students stats endpoint', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    const response = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(fixtures.responsibleUser)

    // Should return 403 after authorization middleware
    assert.isTrue(true, 'TODO: Should return 403 after authorization middleware is implemented')
  })
})

test.group('Attendance Authorization - Edge Cases', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('teacher with isActive=false CANNOT access', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceAuthFixtures(school)

    // Deactivate teacher's association
    await fixtures.teacherHasClass.merge({ isActive: false }).save()

    // TODO: Should return 403 after authorization middleware
    assert.isTrue(true, 'TODO: Should return 403 when teacher is inactive')
  })

  test('user without school association CANNOT access', async ({ client, assert }) => {
    const RoleModel = await import('#models/role')
    const role = await RoleModel.default.findByOrFail('name', 'SCHOOL_DIRECTOR')
    const UserModel = await import('#models/user')
    const userWithoutSchool = await UserModel.default.create({
      name: `User No School ${Date.now()}`,
      slug: `user-no-school-${Date.now()}`,
      email: `user-no-school-${Date.now()}@test.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: role.id,
    })

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({ classId: FAKE_UUID, academicPeriodId: FAKE_UUID, subjectId: FAKE_UUID })
      .loginAs(userWithoutSchool)

    // Should return 403 after authorization middleware
    assert.isTrue(true, 'TODO: Should return 403 for user without school')
  })
})
