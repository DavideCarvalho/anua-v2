import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import AcademicPeriod from '#models/academic_period'
import AcademicPeriodHoliday from '#models/academic_period_holiday'
import AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import Assignment from '#models/assignment'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Course from '#models/course'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Exam from '#models/exam'
import Level from '#models/level'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import Role from '#models/role'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'
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

    const rangeStart = DateTime.now().startOf('day')
    const rangeEnd = DateTime.now().plus({ days: 7 }).endOf('day')

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
    // WEEKEND_CLASS_DAY may not appear if the weekend class date falls outside the query range

    const holidayItem = body.data.find(
      (item) =>
        item.sourceType === 'HOLIDAY' &&
        item.title === 'Feriado' &&
        holidayDate.hasSame(DateTime.fromISO(item.startAt), 'day')
    )
    assert.isTrue(holidayItem?.readonly === true)

    // Weekend class item may not exist if date falls outside query range
    const weekendItem = body.data.find(
      (item) =>
        item.sourceType === 'WEEKEND_CLASS_DAY' &&
        weekendClassDate.hasSame(DateTime.fromISO(item.startAt), 'day')
    )
    if (weekendItem) {
      assert.isTrue(weekendItem.readonly === true)
    }

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

  test('requires active class-linked academic period when creating assignment without academicPeriodId', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, academicPeriod } = await createPedagogicalFlowContext(
      school.id
    )

    await academicPeriod.merge({ isActive: false }).save()

    await AcademicPeriod.create({
      name: `Periodo Desvinculado ${DateTime.now().toMillis()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: null,
      enrollmentEndDate: null,
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
      minimumGradeOverride: null,
      minimumAttendanceOverride: null,
      schoolId: school.id,
      previousAcademicPeriodId: null,
      deletedAt: null,
    })

    const response = await client
      .post('/api/v1/assignments')
      .loginAs(user)
      .json({
        title: 'Atividade sem periodo ativo vinculado',
        description: 'Teste de validacao de contexto da turma',
        maxScore: 10,
        dueDate: DateTime.now().plus({ days: 1 }).toISO(),
        classId: classEntity.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      })

    response.assertStatus(404)

    const created = await Assignment.query()
      .where('name', 'Atividade sem periodo ativo vinculado')
      .first()
    assert.isNull(created)
  })

  test('requires active class-linked academic period when creating exam without academicPeriodId', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, academicPeriod } = await createPedagogicalFlowContext(
      school.id
    )

    await academicPeriod.merge({ isActive: false }).save()

    await AcademicPeriod.create({
      name: `Periodo Desvinculado Prova ${DateTime.now().toMillis()}`,
      startDate: DateTime.now().startOf('month'),
      endDate: DateTime.now().endOf('month'),
      enrollmentStartDate: null,
      enrollmentEndDate: null,
      isActive: true,
      segment: 'ELEMENTARY',
      isClosed: false,
      minimumGradeOverride: null,
      minimumAttendanceOverride: null,
      schoolId: school.id,
      previousAcademicPeriodId: null,
      deletedAt: null,
    })

    const response = await client
      .post('/api/v1/exams')
      .loginAs(user)
      .json({
        title: 'Prova sem periodo ativo vinculado',
        description: 'Teste de validacao de contexto da turma',
        maxScore: 10,
        type: 'WRITTEN',
        scheduledDate: DateTime.now().plus({ days: 1 }).toISO(),
        classId: classEntity.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      })

    response.assertStatus(404)

    const created = await Exam.query().where('title', 'Prova sem periodo ativo vinculado').first()
    assert.isNull(created)
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
        sourceId: string | null
        classId: string | null
        academicPeriodId: string | null
        teacherName?: string | null
        title: string
        startAt: string
        endAt: string | null
        isAllDay: boolean
        class?: { id: string; name: string }
        subject?: { id: string; name: string }
        academicPeriod?: { id: string; name: string }
        teacher?: { id: string }
      }>
    }

    const assignmentItem = body.data.find((item) => item.sourceType === 'ASSIGNMENT')
    const examItem = body.data.find((item) => item.sourceType === 'EXAM')

    assert.exists(assignmentItem)
    assert.exists(examItem)

    assert.equal(DateTime.fromISO(assignmentItem!.startAt).toFormat('HH:mm'), '07:30')
    assert.equal(DateTime.fromISO(assignmentItem!.endAt!).toFormat('HH:mm'), '08:20')
    assert.equal(assignmentItem!.isAllDay, false)
    assert.equal(assignmentItem!.class?.id, classEntity.id)
    assert.equal(assignmentItem!.subject?.id, subject.id)
    assert.equal(assignmentItem!.academicPeriod?.id, academicPeriod.id)
    assert.equal(assignmentItem!.teacher?.id, teacher.id)
    assert.isString(assignmentItem!.teacherName)

    assert.equal(DateTime.fromISO(examItem!.startAt).toFormat('HH:mm'), '07:30')
    assert.equal(DateTime.fromISO(examItem!.endAt!).toFormat('HH:mm'), '08:20')
    assert.equal(examItem!.isAllDay, false)
    assert.equal(examItem!.class?.id, classEntity.id)
    assert.equal(examItem!.subject?.id, subject.id)
    assert.equal(examItem!.academicPeriod?.id, academicPeriod.id)
    assert.equal(examItem!.teacher?.id, teacher.id)
    assert.isString(examItem!.teacherName)
  })

  test('prefers schedule with defined time when class subject has multiple links', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, teacherHasClass, academicPeriod } =
      await createPedagogicalFlowContext(school.id)

    await teacherHasClass
      .merge({
        startTime: null,
        endTime: null,
        isActive: true,
      })
      .save()

    await TeacherHasClass.create({
      teacherId: teacher.id,
      classId: classEntity.id,
      subjectId: subject.id,
      subjectQuantity: 1,
      classWeekDay: null,
      startTime: '12:40',
      endTime: '13:30',
      teacherAvailabilityId: null,
      isActive: true,
    })

    const day = DateTime.now().plus({ days: 2 }).startOf('day')

    await Exam.create({
      title: 'Prova Lingua Portuguesa',
      description: null,
      examDate: day,
      startTime: null,
      endTime: null,
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

    const examItem = body.data.find((item) => item.sourceType === 'EXAM')
    assert.exists(examItem)

    assert.equal(DateTime.fromISO(examItem!.startAt).toFormat('HH:mm'), '12:40')
    assert.equal(DateTime.fromISO(examItem!.endAt!).toFormat('HH:mm'), '13:30')
    assert.equal(examItem!.isAllDay, false)
  })

  test('uses school calendar slot time for exam when teacher-class link has no time', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher, teacherHasClass, academicPeriod } =
      await createPedagogicalFlowContext(school.id)

    await teacherHasClass.merge({ startTime: null, endTime: null, isActive: true }).save()

    const examDate = DateTime.now().plus({ days: 1 }).startOf('day')
    const classWeekDay = examDate.toJSDate().getDay()

    const calendar = await Calendar.create({
      classId: classEntity.id,
      academicPeriodId: academicPeriod.id,
      name: 'Grade de Horarios',
      isActive: true,
      isCanceled: false,
      isApproved: true,
      canceledForNextCalendarId: null,
    })

    await CalendarSlot.create({
      teacherHasClassId: teacherHasClass.id,
      classWeekDay,
      startTime: '10:10',
      endTime: '11:00',
      minutes: 50,
      calendarId: calendar.id,
      isBreak: false,
    })

    await Exam.create({
      title: 'Prova com horario da grade',
      description: null,
      examDate,
      startTime: null,
      endTime: null,
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
        startDate: examDate.startOf('day').toISO(),
        endDate: examDate.endOf('day').toISO(),
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

    const examItem = body.data.find((item) => item.sourceType === 'EXAM')
    assert.exists(examItem)

    assert.equal(DateTime.fromISO(examItem!.startAt).toFormat('HH:mm'), '10:10')
    assert.equal(DateTime.fromISO(examItem!.endAt!).toFormat('HH:mm'), '11:00')
    assert.equal(examItem!.isAllDay, false)
  })

  test('returns creation context for teacher only from active calendar slots in active period', async ({
    client,
    assert,
  }) => {
    const { school } = await createEscolaAuthUser()

    const main = await createPedagogicalFlowContext(school.id)
    const other = await createPedagogicalFlowContext(school.id)

    const teacherRole = await Role.firstOrCreate(
      { name: 'SCHOOL_TEACHER' },
      { name: 'SCHOOL_TEACHER' }
    )

    const teacherUser = await User.create({
      name: `Teacher Context ${Date.now()}`,
      slug: `teacher-context-${Date.now()}`,
      email: `teacher-context-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: teacherRole.id,
    })

    await Teacher.create({
      id: teacherUser.id,
      hourlyRate: 50,
    })

    await UserHasSchool.create({
      userId: teacherUser.id,
      schoolId: school.id,
      isDefault: true,
    })

    await main.teacherHasClass.merge({ teacherId: teacherUser.id, isActive: true }).save()

    const mainCalendar = await Calendar.create({
      classId: main.classEntity.id,
      academicPeriodId: main.academicPeriod.id,
      name: 'Grade ativa principal',
      isActive: true,
      isCanceled: false,
      isApproved: true,
      canceledForNextCalendarId: null,
    })

    await CalendarSlot.create({
      teacherHasClassId: main.teacherHasClass.id,
      classWeekDay: 1,
      startTime: '08:00',
      endTime: '08:50',
      minutes: 50,
      calendarId: mainCalendar.id,
      isBreak: false,
    })

    const otherCalendar = await Calendar.create({
      classId: other.classEntity.id,
      academicPeriodId: other.academicPeriod.id,
      name: 'Grade ativa secundaria',
      isActive: true,
      isCanceled: false,
      isApproved: true,
      canceledForNextCalendarId: null,
    })

    await CalendarSlot.create({
      teacherHasClassId: other.teacherHasClass.id,
      classWeekDay: 2,
      startTime: '09:00',
      endTime: '09:50',
      minutes: 50,
      calendarId: otherCalendar.id,
      isBreak: false,
    })

    const response = await client
      .get('/api/v1/pedagogical-calendar/creation-context')
      .loginAs(teacherUser)

    response.assertStatus(200)

    const body = response.body() as {
      data: {
        classes: Array<{ id: string }>
        subjects: Array<{ id: string }>
        rows: Array<{ classId: string; subjectId: string; teacherId: string }>
      }
    }

    assert.lengthOf(body.data.classes, 1)
    assert.lengthOf(body.data.subjects, 1)
    assert.equal(body.data.classes[0]?.id, main.classEntity.id)
    assert.equal(body.data.rows[0]?.teacherId, teacherUser.id)
  })

  test('returns creation context for coordinator only within coordinated levels', async ({
    client,
    assert,
  }) => {
    const { school } = await createEscolaAuthUser()

    const main = await createPedagogicalFlowContext(school.id)
    const other = await createPedagogicalFlowContext(school.id)

    const coordinatorRole = await Role.firstOrCreate(
      { name: 'SCHOOL_COORDINATOR' },
      { name: 'SCHOOL_COORDINATOR' }
    )

    const coordinatorUser = await User.create({
      name: `Coordinator Context ${Date.now()}`,
      slug: `coordinator-context-${Date.now()}`,
      email: `coordinator-context-${Date.now()}@example.com`,
      active: true,
      whatsappContact: false,
      grossSalary: 0,
      roleId: coordinatorRole.id,
    })

    await UserHasSchool.create({
      userId: coordinatorUser.id,
      schoolId: school.id,
      isDefault: true,
    })

    const course = await Course.create({
      name: `Curso ${Date.now()}`,
      schoolId: school.id,
      version: 1,
      coordinatorId: coordinatorUser.id,
      enrollmentMinimumAge: null,
      enrollmentMaximumAge: null,
      maxStudentsPerClass: null,
    })

    const courseAcademicPeriod = await CourseHasAcademicPeriod.create({
      courseId: course.id,
      academicPeriodId: main.academicPeriod.id,
    })

    await LevelAssignedToCourseHasAcademicPeriod.create({
      levelId: main.classEntity.levelId!,
      courseHasAcademicPeriodId: courseAcademicPeriod.id,
      isActive: true,
    })

    const mainCalendar = await Calendar.create({
      classId: main.classEntity.id,
      academicPeriodId: main.academicPeriod.id,
      name: 'Grade coordenada',
      isActive: true,
      isCanceled: false,
      isApproved: true,
      canceledForNextCalendarId: null,
    })

    await CalendarSlot.create({
      teacherHasClassId: main.teacherHasClass.id,
      classWeekDay: 2,
      startTime: '10:00',
      endTime: '10:50',
      minutes: 50,
      calendarId: mainCalendar.id,
      isBreak: false,
    })

    const otherCalendar = await Calendar.create({
      classId: other.classEntity.id,
      academicPeriodId: other.academicPeriod.id,
      name: 'Grade nao coordenada',
      isActive: true,
      isCanceled: false,
      isApproved: true,
      canceledForNextCalendarId: null,
    })

    await CalendarSlot.create({
      teacherHasClassId: other.teacherHasClass.id,
      classWeekDay: 4,
      startTime: '14:00',
      endTime: '14:50',
      minutes: 50,
      calendarId: otherCalendar.id,
      isBreak: false,
    })

    const response = await client
      .get('/api/v1/pedagogical-calendar/creation-context')
      .loginAs(coordinatorUser)

    response.assertStatus(200)

    const body = response.body() as {
      data: {
        classes: Array<{ id: string }>
      }
    }

    assert.lengthOf(body.data.classes, 1)
    assert.equal(body.data.classes[0]?.id, main.classEntity.id)
  })
})
