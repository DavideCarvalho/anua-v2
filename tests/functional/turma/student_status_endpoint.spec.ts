import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import Attendance from '#models/attendance'
import Subject from '#models/subject'
import TeacherHasClass from '#models/teacher_has_class'
import CalendarSlot from '#models/calendar_slot'
import StudentHasAttendance from '#models/student_has_attendance'
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

  test('calculates attendance only from classes with student launch records', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    const secondSubject = await Subject.create({
      schoolId: school.id,
      name: `Matéria Extra ${Date.now()}`,
      slug: `materia-extra-${Date.now()}`,
      quantityNeededScheduled: 1,
    })

    const secondTeacherHasClass = await TeacherHasClass.create({
      teacherId: fixtures.teacher.id,
      classId: fixtures.classEntity.id,
      subjectId: secondSubject.id,
      subjectQuantity: 1,
      isActive: true,
    })

    const secondSlot = await CalendarSlot.create({
      calendarId: fixtures.calendar.id,
      teacherHasClassId: secondTeacherHasClass.id,
      classWeekDay: 4,
      startTime: '10:30',
      endTime: '11:30',
      minutes: 60,
      isBreak: false,
    })

    const firstSubjectAttendance = await Attendance.create({
      calendarSlotId: fixtures.slots[0]!.id,
      date: DateTime.now().minus({ days: 1 }),
      note: null,
    })

    const secondSubjectAttendance = await Attendance.create({
      calendarSlotId: secondSlot.id,
      date: DateTime.now().minus({ days: 1 }),
      note: null,
    })

    await StudentHasAttendance.create({
      studentId: fixtures.students[0]!.id,
      attendanceId: firstSubjectAttendance.id,
      status: 'PRESENT',
      justification: null,
    })

    void secondSubjectAttendance

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
      attendancePercentage: number
      status: string
      failureReason: 'GRADE' | 'ATTENDANCE' | 'BOTH' | null
    }>

    const firstStudent = body.find((item) => item.id === fixtures.students[0]!.id)
    assert.exists(firstStudent)
    assert.equal(firstStudent?.attendancePercentage, 100)
    assert.notEqual(firstStudent?.status, 'FAILED')
  })

  test('does not mark attendance risk when attendance is 100%', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const fixtures = await createAttendanceFixtures(school)

    const attendance = await Attendance.create({
      calendarSlotId: fixtures.slots[0]!.id,
      date: DateTime.now().minus({ days: 1 }),
      note: null,
    })

    await StudentHasAttendance.create({
      studentId: fixtures.students[0]!.id,
      attendanceId: attendance.id,
      status: 'PRESENT',
      justification: null,
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
      attendancePercentage: number
    }>

    const firstStudent = body.find((item) => item.id === fixtures.students[0]!.id)
    assert.exists(firstStudent)
    assert.equal(firstStudent?.attendancePercentage, 100)
    assert.notEqual(firstStudent?.status, 'AT_RISK_ATTENDANCE')
  })
})
