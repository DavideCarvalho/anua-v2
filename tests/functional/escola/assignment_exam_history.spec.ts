import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import AcademicPeriod from '#models/academic_period'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import Level from '#models/level'
import Role from '#models/role'
import Student from '#models/student'
import Subject from '#models/subject'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createContext(schoolId: string) {
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

  await TeacherHasClass.create({
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

  return {
    classEntity,
    subject,
    teacher,
  }
}

async function createStudentContext(schoolId: string) {
  const now = DateTime.now()

  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const studentUser = await User.create({
    name: `Aluno ${now.toMillis()}`,
    slug: `aluno-${now.toMillis()}`,
    email: `aluno-${now.toMillis()}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: studentRole.id,
  })

  const student = await Student.create({
    id: studentUser.id,
    classId: null,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    contractId: null,
    canteenLimit: null,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  return { student }
}

test.group('Assignment and exam history', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('creates assignment history with field-level diff on update', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)

    const originalDueDate = DateTime.now().plus({ days: 2 }).startOf('day')
    const updatedDueDate = originalDueDate.plus({ days: 1 })

    const createResponse = await client.post('/api/v1/assignments').loginAs(user).json({
      title: 'Atividade para historico',
      description: 'Descricao inicial',
      maxScore: 7,
      dueDate: originalDueDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    createResponse.assertStatus(201)
    const createdAssignment = createResponse.body() as {
      id: string
      teacherHasClass?: { classId: string; subjectId: string }
    }
    const assignmentId = createdAssignment.id
    assert.exists(createdAssignment.teacherHasClass)
    assert.equal(createdAssignment.teacherHasClass?.classId, classEntity.id)
    assert.equal(createdAssignment.teacherHasClass?.subjectId, subject.id)

    const updateResponse = await client
      .put(`/api/v1/assignments/${assignmentId}`)
      .loginAs(user)
      .json({
        dueDate: updatedDueDate.toISO(),
        maxScore: 9,
      })

    updateResponse.assertStatus(200)

    const historyRows = await db
      .from('assignment_histories')
      .where('assignmentId', assignmentId)
      .orderBy('changedAt', 'desc')

    assert.lengthOf(historyRows, 1)

    const history = historyRows[0] as {
      actorUserId: string
      changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
    }

    assert.equal(history.actorUserId, user.id)

    const dueDateChange = history.changes.find((change) => change.field === 'dueDate')
    assert.exists(dueDateChange)
    assert.isString(dueDateChange?.oldValue)
    assert.isString(dueDateChange?.newValue)
    assert.include(dueDateChange?.oldValue as string, originalDueDate.toISODate()!)
    assert.include(dueDateChange?.newValue as string, updatedDueDate.toISODate()!)

    const gradeChange = history.changes.find((change) => change.field === 'maxScore')
    assert.exists(gradeChange)
    assert.equal(gradeChange?.oldValue, 7)
    assert.equal(gradeChange?.newValue, 9)

    const historyResponse = await client
      .get(`/api/v1/assignments/${assignmentId}/history`)
      .loginAs(user)

    historyResponse.assertStatus(200)

    const historyBody = historyResponse.body() as {
      data: Array<{
        assignmentId: string
        actorUserId: string
        changedAt: string
        actorUser: { id: string; name: string } | null
        changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
      }>
    }

    assert.lengthOf(historyBody.data, 1)
    assert.equal(historyBody.data[0]?.assignmentId, assignmentId)
    assert.equal(historyBody.data[0]?.actorUserId, user.id)
    assert.equal(historyBody.data[0]?.actorUser?.id, user.id)
    assert.isString(historyBody.data[0]?.changedAt)
    assert.equal(historyBody.data[0]?.changes[0]?.field, 'maxScore')
  })

  test('creates exam history with field-level diff on update', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)

    const originalExamDate = DateTime.now().plus({ days: 3 }).startOf('day')
    const updatedExamDate = originalExamDate.plus({ days: 2 })

    const createResponse = await client.post('/api/v1/exams').loginAs(user).json({
      title: 'Prova para historico',
      description: 'Descricao inicial',
      maxScore: 10,
      type: 'WRITTEN',
      scheduledDate: originalExamDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    createResponse.assertStatus(201)
    const createdExam = createResponse.body() as {
      id: string
      teacher?: { id: string; hourlyRate?: number }
    }
    const examId = createdExam.id
    assert.equal(createdExam.teacher?.id, teacher.id)
    assert.equal(createdExam.teacher?.hourlyRate, teacher.hourlyRate)

    const updateResponse = await client.put(`/api/v1/exams/${examId}`).loginAs(user).json({
      scheduledDate: updatedExamDate.toISODate(),
      status: 'COMPLETED',
    })

    updateResponse.assertStatus(200)

    const historyRows = await db
      .from('exam_histories')
      .where('examId', examId)
      .orderBy('changedAt', 'desc')

    assert.lengthOf(historyRows, 1)

    const history = historyRows[0] as {
      actorUserId: string
      changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
    }

    assert.equal(history.actorUserId, user.id)

    const dateChange = history.changes.find((change) => change.field === 'scheduledDate')
    assert.exists(dateChange)
    assert.isString(dateChange?.oldValue)
    assert.isString(dateChange?.newValue)
    assert.include(dateChange?.oldValue as string, originalExamDate.toISODate()!)
    assert.include(dateChange?.newValue as string, updatedExamDate.toISODate()!)

    const statusChange = history.changes.find((change) => change.field === 'status')
    assert.exists(statusChange)
    assert.equal(statusChange?.oldValue, 'SCHEDULED')
    assert.equal(statusChange?.newValue, 'COMPLETED')

    const historyResponse = await client.get(`/api/v1/exams/${examId}/history`).loginAs(user)

    historyResponse.assertStatus(200)

    const historyBody = historyResponse.body() as {
      data: Array<{
        examId: string
        actorUserId: string
        changedAt: string
        actorUser: { id: string; name: string } | null
        changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>
      }>
    }

    assert.lengthOf(historyBody.data, 1)
    assert.equal(historyBody.data[0]?.examId, examId)
    assert.equal(historyBody.data[0]?.actorUserId, user.id)
    assert.equal(historyBody.data[0]?.actorUser?.id, user.id)
    assert.isString(historyBody.data[0]?.changedAt)
    assert.equal(historyBody.data[0]?.changes[0]?.field, 'status')
  })

  test('updates exam when scheduledDate is ISO datetime string', async ({ client }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)

    const scheduledDate = DateTime.now().plus({ days: 3 }).startOf('day')
    const updatedDateTime = scheduledDate.plus({ days: 1 }).plus({ hours: 9 })

    const createResponse = await client.post('/api/v1/exams').loginAs(user).json({
      title: 'Prova update datetime ISO',
      description: 'Descricao inicial',
      maxScore: 10,
      type: 'WRITTEN',
      scheduledDate: scheduledDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    createResponse.assertStatus(201)
    const examId = (createResponse.body() as { id: string }).id

    const updateResponse = await client
      .put(`/api/v1/exams/${examId}`)
      .loginAs(user)
      .redirects(0)
      .json({
        scheduledDate: updatedDateTime.toISO(),
      })

    updateResponse.assertStatus(200)
  })

  test('returns examDate in show payload for edit modal compatibility', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)

    const scheduledDate = DateTime.now().plus({ days: 4 }).startOf('day')

    const createResponse = await client.post('/api/v1/exams').loginAs(user).json({
      title: 'Prova compatibilidade show',
      description: 'Descricao',
      maxScore: 10,
      type: 'WRITTEN',
      scheduledDate: scheduledDate.toISO(),
      classId: classEntity.id,
      subjectId: subject.id,
      teacherId: teacher.id,
    })

    createResponse.assertStatus(201)
    const examId = (createResponse.body() as { id: string }).id

    const showResponse = await client.get(`/api/v1/exams/${examId}`).loginAs(user)

    showResponse.assertStatus(200)

    const body = showResponse.body() as {
      scheduledDate?: string
      examDate?: string
    }

    assert.isString(body.scheduledDate)
    assert.isString(body.examDate)
    assert.equal(body.examDate, body.scheduledDate)
  })

  test('returns assignment relation when submitting and grading assignment', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)
    const { student } = await createStudentContext(school.id)

    const createAssignmentResponse = await client
      .post('/api/v1/assignments')
      .loginAs(user)
      .json({
        title: 'Atividade com submissao',
        description: 'Descricao',
        maxScore: 10,
        dueDate: DateTime.now().plus({ days: 5 }).toISO(),
        classId: classEntity.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      })

    createAssignmentResponse.assertStatus(201)
    const assignmentId = (createAssignmentResponse.body() as { id: string }).id

    const submitResponse = await client
      .post(`/api/v1/assignments/${assignmentId}/submissions`)
      .loginAs(user)
      .json({ studentId: student.id })

    submitResponse.assertStatus(201)

    const submitBody = submitResponse.body() as {
      assignmentId: string
      studentId: string
      assignment?: { id: string }
    }

    assert.equal(submitBody.assignmentId, assignmentId)
    assert.equal(submitBody.studentId, student.id)
    assert.equal(submitBody.assignment?.id, assignmentId)

    const submissionId = (submitResponse.body() as { id: string }).id

    const gradeResponse = await client
      .post(`/api/v1/assignments/${assignmentId}/submissions/${submissionId}`)
      .loginAs(user)
      .json({ grade: 8.5 })

    gradeResponse.assertStatus(200)

    const gradeBody = gradeResponse.body() as {
      grade: number
      assignment?: { id: string }
    }

    assert.equal(gradeBody.grade, 8.5)
    assert.equal(gradeBody.assignment?.id, assignmentId)
  })

  test('returns exam relation when creating and updating exam grade', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const { classEntity, subject, teacher } = await createContext(school.id)
    const { student } = await createStudentContext(school.id)

    const createExamResponse = await client
      .post('/api/v1/exams')
      .loginAs(user)
      .json({
        title: 'Prova com notas',
        description: 'Descricao',
        maxScore: 10,
        type: 'WRITTEN',
        scheduledDate: DateTime.now().plus({ days: 3 }).toISO(),
        classId: classEntity.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      })

    createExamResponse.assertStatus(201)
    const examId = (createExamResponse.body() as { id: string }).id

    const createGradeResponse = await client
      .post(`/api/v1/exams/${examId}/grades`)
      .loginAs(user)
      .json({
        studentId: student.id,
        score: 7.75,
        feedback: 'Bom progresso',
      })

    createGradeResponse.assertStatus(201)

    const createdGradeBody = createGradeResponse.body() as {
      id: string
      score: number
      exam?: { id: string }
    }

    assert.equal(createdGradeBody.score, 7.75)
    assert.equal(createdGradeBody.exam?.id, examId)

    const updateGradeResponse = await client
      .put(`/api/v1/exams/${examId}/grades/${createdGradeBody.id}`)
      .loginAs(user)
      .json({
        studentId: student.id,
        score: 9,
        feedback: 'Excelente',
        absent: false,
      })

    updateGradeResponse.assertStatus(200)

    const updatedGradeBody = updateGradeResponse.body() as {
      score: number
      exam?: { id: string }
    }

    assert.equal(updatedGradeBody.score, 9)
    assert.equal(updatedGradeBody.exam?.id, examId)
  })
})
