import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import AcademicPeriod from '#models/academic_period'
import AcademicPeriodHoliday from '#models/academic_period_holiday'
import AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import Assignment from '#models/assignment'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Exam from '#models/exam'
import Level from '#models/level'
import Role from '#models/role'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createPedagogicalFlowContext(schoolId: string) {
  const now = DateTime.now()

  const academicPeriod = await AcademicPeriod.create({
    name: `Periodo ${now.toMillis()}`,
    startDate: now.startOf('month'),
    endDate: now.endOf('month'),
    enrollmentStartDate: null,
    enrollmentEndDate: null,
    isActive: true,
    segment: 'ELEMENTARY',
    isClosed: false,
    minimumGradeOverride: null,
    minimumAttendanceOverride: null,
    schoolId,
    previousAcademicPeriodId: null,
    deletedAt: null,
  })

  const level = await Level.create({
    name: `Nivel ${now.toMillis()}`,
    order: 1,
    schoolId,
    contractId: null,
    isActive: true,
  })

  const classEntity = await Class_.create({
    name: `Turma ${now.toMillis()}`,
    schoolId,
    levelId: level.id,
    isArchived: false,
  })

  await ClassHasAcademicPeriod.create({
    classId: classEntity.id,
    academicPeriodId: academicPeriod.id,
  })

  const subject = await Subject.create({
    name: `Matematica ${now.toMillis()}`,
    slug: `matematica-${now.toMillis()}`,
    quantityNeededScheduled: 1,
    schoolId,
  })

  const teacherRole = await Role.firstOrCreate(
    { name: 'SCHOOL_TEACHER' },
    { name: 'SCHOOL_TEACHER' }
  )

  const teacherUser = await User.create({
    name: `Professor ${now.toMillis()}`,
    slug: `professor-${now.toMillis()}`,
    email: `professor-${now.toMillis()}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: teacherRole.id,
  })

  const teacher = await Teacher.create({
    id: teacherUser.id,
    hourlyRate: 50,
  })

  const teacherHasClass = await TeacherHasClass.create({
    teacherId: teacher.id,
    classId: classEntity.id,
    subjectId: subject.id,
    subjectQuantity: 1,
    classWeekDay: null,
    startTime: null,
    endTime: null,
    teacherAvailabilityId: null,
    isActive: true,
  })

  const holidayDate = now.plus({ days: 2 }).startOf('day')
  const weekendClassDate = now.plus({ days: 6 }).startOf('day')

  await AcademicPeriodHoliday.create({
    date: holidayDate,
    academicPeriodId: academicPeriod.id,
  })

  await AcademicPeriodWeekendClass.create({
    date: weekendClassDate,
    academicPeriodId: academicPeriod.id,
  })

  return {
    academicPeriod,
    classEntity,
    subject,
    teacher,
    teacherHasClass,
    holidayDate,
    weekendClassDate,
  }
}

test.group('Pedagogical calendar flow', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('returns unified weekly planner flow with assignment exam and special days', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, holidayDate, weekendClassDate } =
      await createPedagogicalFlowContext(school.id)

    const assignmentDate = DateTime.now().plus({ days: 1 }).startOf('day')
    const examDate = DateTime.now().plus({ days: 3 }).startOf('day')

    const assignmentResponse = await client.post('/api/v1/assignments').loginAs(user).json({
      title: 'Atividade Semanario',
      description: 'Atividade criada pela tela de semanario',
      maxScore: 10,
      dueDate: assignmentDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    assignmentResponse.assertStatus(201)

    const examResponse = await client.post('/api/v1/exams').loginAs(user).json({
      title: 'Prova Semanario',
      description: 'Prova criada pela tela de semanario',
      maxScore: 10,
      type: 'WRITTEN',
      scheduledDate: examDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    examResponse.assertStatus(201)

    const rangeStart = DateTime.now().startOf('month')
    const rangeEnd = DateTime.now().endOf('month')

    const listResponse = await client.get('/api/v1/pedagogical-calendar').loginAs(user).qs({
      classId: classEntity.id,
      startDate: rangeStart.toISO(),
      endDate: rangeEnd.toISO(),
    })

    listResponse.assertStatus(200)

    const body = listResponse.body() as {
      data: Array<{
        sourceType: string
        title: string
        startAt: string
        readonly: boolean
        meta: { status?: string }
      }>
    }

    const sourceTypes = body.data.map((item) => item.sourceType)
    assert.include(sourceTypes, 'ASSIGNMENT')
    assert.include(sourceTypes, 'EXAM')
    assert.include(sourceTypes, 'HOLIDAY')
    assert.include(sourceTypes, 'WEEKEND_CLASS_DAY')

    const holidayItem = body.data.find(
      (item) =>
        item.sourceType === 'HOLIDAY' &&
        item.title === 'Feriado' &&
        holidayDate.hasSame(DateTime.fromISO(item.startAt), 'day')
    )
    assert.isTrue(holidayItem?.readonly === true)

    const weekendItem = body.data.find(
      (item) =>
        item.sourceType === 'WEEKEND_CLASS_DAY' &&
        weekendClassDate.hasSame(DateTime.fromISO(item.startAt), 'day')
    )
    assert.isTrue(weekendItem?.readonly === true)

    const examItem = body.data.find(
      (item) => item.sourceType === 'EXAM' && item.title === 'Prova Semanario'
    )
    assert.equal(examItem?.meta?.status, 'SCHEDULED')

    const assignmentsScreenResponse = await client
      .get('/api/v1/assignments')
      .loginAs(user)
      .qs({ classId: classEntity.id })
    assignmentsScreenResponse.assertStatus(200)

    const assignmentsScreenBody = assignmentsScreenResponse.body() as {
      data: Array<{ name: string }>
    }
    assert.include(
      assignmentsScreenBody.data.map((item) => item.name),
      'Atividade Semanario'
    )

    const examsScreenResponse = await client
      .get('/api/v1/exams')
      .loginAs(user)
      .qs({ classId: classEntity.id })
    examsScreenResponse.assertStatus(200)

    const examsScreenBody = examsScreenResponse.body() as {
      data: Array<{ title: string }>
    }
    assert.include(
      examsScreenBody.data.map((item) => item.title),
      'Prova Semanario'
    )
  })

  test('keeps class context isolation for semanario flow', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()

    const main = await createPedagogicalFlowContext(school.id)
    const other = await createPedagogicalFlowContext(school.id)

    const dueDate = DateTime.now().plus({ days: 1 }).startOf('day')

    await client.post('/api/v1/assignments').loginAs(user).json({
      title: 'Atividade Turma Principal',
      description: 'Visivel na turma principal',
      maxScore: 8,
      dueDate: dueDate.toISO(),
      classId: main.classEntity.id,
      subjectId: main.subject.id,
      teacherId: main.teacher.id,
    })

    await client.post('/api/v1/assignments').loginAs(user).json({
      title: 'Atividade Outra Turma',
      description: 'Nao deve aparecer na turma principal',
      maxScore: 9,
      dueDate: dueDate.toISO(),
      classId: other.classEntity.id,
      subjectId: other.subject.id,
      teacherId: other.teacher.id,
    })

    const listResponse = await client
      .get('/api/v1/pedagogical-calendar')
      .loginAs(user)
      .qs({
        classId: main.classEntity.id,
        startDate: DateTime.now().startOf('month').toISO(),
        endDate: DateTime.now().endOf('month').toISO(),
      })

    listResponse.assertStatus(200)

    const body = listResponse.body() as {
      data: Array<{ sourceType: string; title: string }>
    }

    const assignmentTitles = body.data
      .filter((item) => item.sourceType === 'ASSIGNMENT')
      .map((item) => item.title)

    assert.include(assignmentTitles, 'Atividade Turma Principal')
    assert.notInclude(assignmentTitles, 'Atividade Outra Turma')
  })

  test('uses class schedule time for assignment and exam in calendar payload', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, teacherHasClass, academicPeriod } =
      await createPedagogicalFlowContext(school.id)

    await teacherHasClass.merge({ startTime: '07:30', endTime: '08:20' }).save()

    const day = DateTime.now().plus({ days: 1 }).startOf('day')

    await Assignment.create({
      name: 'Atividade com horario da aula',
      description: null,
      dueDate: day,
      grade: 10,
      teacherHasClassId: teacherHasClass.id,
      academicPeriodId: academicPeriod.id,
    })

    await Exam.create({
      title: 'Prova com horario da aula',
      description: null,
      examDate: day,
      startTime: day.set({ hour: 9, minute: 0 }),
      endTime: day.set({ hour: 10, minute: 0 }),
      location: null,
      maxScore: 10,
      weight: 1,
      type: 'WRITTEN',
      status: 'SCHEDULED',
      instructions: null,
      schoolId: school.id,
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
      academicPeriodId: academicPeriod.id,
    })

    const response = await client
      .get('/api/v1/pedagogical-calendar')
      .loginAs(user)
      .qs({
        classId: classEntity.id,
        startDate: day.startOf('day').toISO(),
        endDate: day.endOf('day').toISO(),
      })

    response.assertStatus(200)

    const body = response.body() as {
      data: Array<{
        sourceType: string
        title: string
        startAt: string
        endAt: string | null
        isAllDay: boolean
      }>
    }

    const assignmentItem = body.data.find((item) => item.sourceType === 'ASSIGNMENT')
    const examItem = body.data.find((item) => item.sourceType === 'EXAM')

    assert.exists(assignmentItem)
    assert.exists(examItem)

    assert.equal(DateTime.fromISO(assignmentItem!.startAt).toFormat('HH:mm'), '07:30')
    assert.equal(DateTime.fromISO(assignmentItem!.endAt!).toFormat('HH:mm'), '08:20')
    assert.equal(assignmentItem!.isAllDay, false)

    assert.equal(DateTime.fromISO(examItem!.startAt).toFormat('HH:mm'), '07:30')
    assert.equal(DateTime.fromISO(examItem!.endAt!).toFormat('HH:mm'), '08:20')
    assert.equal(examItem!.isAllDay, false)
  })
})
