import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'
import { createAttendanceFixtures } from '#tests/helpers/attendance_fixtures'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

test.group('Attendance API - Basic auth', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('redirects unauthenticated request to login for class students endpoint', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get(`/api/v1/attendance/class/${FAKE_UUID}/students`)
      .qs({ courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .redirects(0)
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.startsWith('/login'))
  })

  test('redirects unauthenticated request to login for batch create', async ({
    client,
    assert,
  }) => {
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

  test('returns 404 for non-existent class', async ({ client }) => {
    const { user } = await createEscolaAuthUser()
    const response = await client
      .get(`/api/v1/attendance/class/${FAKE_UUID}/students`)
      .qs({ courseId: FAKE_UUID, academicPeriodId: FAKE_UUID })
      .loginAs(user)
    response.assertStatus(404)
  })
})

test.group('Attendance API - Complete flow', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('complete flow: available dates → register → verify stats', async ({ client, assert }) => {
    // 1. Setup: criar usuário autenticado e fixtures
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    // 2. Verificar datas disponíveis ANTES de registrar
    const beforeResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    beforeResponse.assertStatus(200)
    const datesBefore = beforeResponse.body().dates
    assert.isAbove(datesBefore.length, 0, 'Should have available dates before attendance')

    // 3. Registrar presença para o primeiro horário disponível
    const firstDate = datesBefore[0]
    const batchResponse = await client
      .post('/api/v1/attendance/batch')
      .loginAs(user)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: [firstDate.date],
        attendances: [
          { studentId: fixtures.students[0].id, status: 'PRESENT' },
          { studentId: fixtures.students[1].id, status: 'ABSENT' },
        ],
      })

    batchResponse.assertStatus(201)
    assert.equal(batchResponse.body().count, 1, 'Should create 1 attendance record')

    // 4. Verificar datas disponíveis DEPOIS de registrar (deve ter diminuído)
    const afterResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    afterResponse.assertStatus(200)
    const datesAfter = afterResponse.body().dates
    assert.isBelow(
      datesAfter.length,
      datesBefore.length,
      `Should have fewer available dates. Before: ${datesBefore.length}, After: ${datesAfter.length}`
    )

    // 5. Verificar estatísticas na listagem de alunos
    const statsResponse = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(user)

    statsResponse.assertStatus(200)
    const responseBody = statsResponse.body()
    assert.exists(responseBody.data, 'Response should have data')

    const studentsData = responseBody.data
    assert.isAtLeast(studentsData.length, 2, 'Should have at least 2 students')

    // Verificar aluno 1 (PRESENTE)
    const student1Stats = studentsData.find((s: any) => s.student.id === fixtures.students[0].id)
    assert.exists(student1Stats, 'Should find student 1 stats')
    assert.equal(student1Stats.presentCount, 1, 'Student 1 should have 1 present')
    assert.equal(student1Stats.absentCount, 0, 'Student 1 should have 0 absent')
    assert.equal(student1Stats.lateCount, 0, 'Student 1 should have 0 late')
    assert.equal(student1Stats.justifiedCount, 0, 'Student 1 should have 0 justified')
    assert.isAbove(student1Stats.attendancePercentage, 0, 'Student 1 should have attendance > 0%')
    assert.equal(student1Stats.attendancePercentage, 100, 'Student 1 should have 100% attendance')

    // Verificar aluno 2 (AUSENTE)
    const student2Stats = studentsData.find((s: any) => s.student.id === fixtures.students[1].id)
    assert.exists(student2Stats, 'Should find student 2 stats')
    assert.equal(student2Stats.presentCount, 0, 'Student 2 should have 0 present')
    assert.equal(student2Stats.absentCount, 1, 'Student 2 should have 1 absent')
    assert.equal(student2Stats.lateCount, 0, 'Student 2 should have 0 late')
    assert.equal(student2Stats.justifiedCount, 0, 'Student 2 should have 0 justified')
    assert.equal(student2Stats.attendancePercentage, 0, 'Student 2 should have 0% attendance')

    // Verificar total de aulas
    assert.equal(student1Stats.totalClasses, 1, 'Student 1 should have totalClasses = 1')
    assert.equal(student2Stats.totalClasses, 1, 'Student 2 should have totalClasses = 1')
  })

  test('registers attendance for multiple dates and accumulates stats', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    // Pegar as 2 primeiras datas disponíveis
    const availableResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    const dates = availableResponse.body().dates
    assert.isAtLeast(dates.length, 2, 'Should have at least 2 available dates')

    const firstTwoDates = dates.slice(0, 2).map((d: any) => d.date)

    // Registrar presença nas 2 datas
    const batchResponse = await client
      .post('/api/v1/attendance/batch')
      .loginAs(user)
      .json({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: firstTwoDates,
        attendances: [
          { studentId: fixtures.students[0].id, status: 'PRESENT' },
          { studentId: fixtures.students[1].id, status: 'PRESENT' },
        ],
      })

    batchResponse.assertStatus(201)
    assert.equal(batchResponse.body().count, 2, 'Should create 2 attendance records')

    // Verificar estatísticas
    const statsResponse = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(user)

    statsResponse.assertStatus(200)
    const studentsData = statsResponse.body().data

    const student1Stats = studentsData.find((s: any) => s.student.id === fixtures.students[0].id)
    assert.equal(student1Stats.presentCount, 2, 'Student 1 should have 2 presents')
    assert.equal(student1Stats.totalClasses, 2, 'Student 1 should have 2 total classes')
    assert.equal(student1Stats.attendancePercentage, 100, 'Student 1 should have 100% attendance')

    const student2Stats = studentsData.find((s: any) => s.student.id === fixtures.students[1].id)
    assert.equal(student2Stats.presentCount, 2, 'Student 2 should have 2 presents')
    assert.equal(student2Stats.totalClasses, 2, 'Student 2 should have 2 total classes')
    assert.equal(student2Stats.attendancePercentage, 100, 'Student 2 should have 100% attendance')
  })

  test('handles different attendance statuses correctly', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    const availableResponse = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    const dates = availableResponse.body().dates
    assert.isAtLeast(dates.length, 1, 'Should have at least 1 available date')

    // Registrar com diferentes status
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
          { studentId: fixtures.students[1].id, status: 'LATE' },
        ],
      })

    batchResponse.assertStatus(201)

    // Verificar estatísticas
    const statsResponse = await client
      .get(`/api/v1/attendance/class/${fixtures.classEntity.id}/students`)
      .qs({
        courseId: fixtures.course.id,
        academicPeriodId: fixtures.academicPeriod.id,
      })
      .loginAs(user)

    const studentsData = statsResponse.body().data

    const student1Stats = studentsData.find((s: any) => s.student.id === fixtures.students[0].id)
    assert.equal(student1Stats.presentCount, 1)
    assert.equal(student1Stats.lateCount, 0)
    assert.equal(student1Stats.attendancePercentage, 100)

    const student2Stats = studentsData.find((s: any) => s.student.id === fixtures.students[1].id)
    assert.equal(student2Stats.presentCount, 0)
    assert.equal(student2Stats.lateCount, 1)
    // Late counts as present for attendance percentage
    assert.equal(student2Stats.attendancePercentage, 100)
  })

  test('returns empty dates when no calendar exists', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    // Deletar os slots primeiro (devido à FK), depois o calendário
    await CalendarSlot.query().where('calendarId', fixtures.calendar.id).delete()
    await Calendar.query().where('id', fixtures.calendar.id).delete()

    const response = await client
      .get('/api/v1/attendance/available-dates')
      .qs({
        classId: fixtures.classEntity.id,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
      })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().dates.length, 0, 'Should return empty dates array')
  })

  test('returns error when class does not exist', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    // Test with non-existent classId
    const response = await client
      .post('/api/v1/attendance/batch')
      .loginAs(user)
      .json({
        classId: FAKE_UUID,
        academicPeriodId: fixtures.academicPeriod.id,
        subjectId: fixtures.subject.id,
        dates: ['2025-01-15'],
        attendances: [{ studentId: fixtures.students[0].id, status: 'PRESENT' }],
      })

    response.assertStatus(400)
  })
})
