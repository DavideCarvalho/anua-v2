import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasLevel from '#models/student_has_level'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryReadStatus from '#models/parent_inquiry_read_status'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import Level from '#models/level'
import Course from '#models/course'
import AcademicPeriod from '#models/academic_period'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'

async function createUserWithRole(roleName: string, seed: string, schoolId?: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  const userData: {
    name: string
    slug: string
    email: string
    active: boolean
    whatsappContact: boolean
    grossSalary: number
    roleId: string
    schoolId?: string
  } = {
    name: `${roleName} User ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  }

  if (schoolId) {
    userData.schoolId = schoolId
  }

  const user = await User.create(userData)

  return user
}

async function createEnrollmentFixtures(schoolId: string, seed: string) {
  const course = await Course.create({
    schoolId,
    name: `Course ${seed}`,
  })

  const level = await Level.create({
    schoolId,
    name: `Level ${seed}`,
    order: 1,
    isActive: true,
  })

  const academicPeriod = await AcademicPeriod.create({
    schoolId,
    name: `Period ${seed}`,
    startDate: DateTime.now(),
    endDate: DateTime.now().plus({ years: 1 }),
    isActive: true,
    segment: 'OTHER',
    isClosed: false,
  })

  const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create({
    courseId: course.id,
    academicPeriodId: academicPeriod.id,
  })

  const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
    levelId: level.id,
    courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
    isActive: true,
  })

  return { levelAssignment }
}

async function createStudentWithResponsible(params: {
  schoolId: string
  responsibleId: string
  seed: string
  levelAssignmentId?: string
}) {
  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const studentUser = await User.create({
    name: `Student ${params.seed}`,
    slug: `student-${params.seed}`,
    email: `student-${params.seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: studentRole.id,
    schoolId: params.schoolId,
  })

  const student = await Student.create({
    id: studentUser.id,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  await StudentHasResponsible.create({
    studentId: student.id,
    responsibleId: params.responsibleId,
    isPedagogical: true,
    isFinancial: true,
  })

  if (params.levelAssignmentId) {
    await StudentHasLevel.create({
      studentId: student.id,
      levelAssignedToCourseAcademicPeriodId: params.levelAssignmentId,
    })
  }

  return student
}

async function createInquiryForStudent(params: {
  studentId: string
  responsibleId: string
  schoolId: string
  seed: string
  status?: 'OPEN' | 'RESOLVED' | 'CLOSED'
  resolvedBy?: string | null
}) {
  const inquiry = await ParentInquiry.create({
    studentId: params.studentId,
    createdByResponsibleId: params.responsibleId,
    schoolId: params.schoolId,
    subject: `Inquiry ${params.seed}`,
    status: params.status ?? 'OPEN',
    resolvedBy: params.resolvedBy ?? null,
  })

  await ParentInquiryMessage.create({
    inquiryId: inquiry.id,
    authorId: params.responsibleId,
    authorType: 'RESPONSIBLE',
    body: `Message body for ${params.seed}`,
  })

  return inquiry
}

test.group('Responsavel inquiries API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('keeps inquiries list endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client
      .get('/api/v1/responsavel/students/some-student-id/inquiries')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('keeps inquiry create endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client
      .post('/api/v1/responsavel/students/some-student-id/inquiries')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('keeps inquiry show endpoint protected for unauthenticated requests', async ({ client }) => {
    const response = await client.get('/api/v1/responsavel/inquiries/some-inquiry-id').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('keeps inquiry message endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client
      .post('/api/v1/responsavel/inquiries/some-inquiry-id/messages')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('keeps inquiry resolve endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client
      .post('/api/v1/responsavel/inquiries/some-inquiry-id/resolve')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('keeps inquiry mark-read endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client
      .post('/api/v1/responsavel/inquiries/some-inquiry-id/mark-read')
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('lists only inquiries for authenticated responsible students', async ({
    client,
    assert,
  }) => {
    const seed = Date.now().toString()
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const otherStudent = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: otherResponsible.id,
      seed: `${seed}-other-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-included`,
    })

    await createInquiryForStudent({
      studentId: otherStudent.id,
      responsibleId: otherResponsible.id,
      schoolId: school.id,
      seed: `${seed}-excluded`,
    })

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/inquiries`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, inquiry.id)
    assert.equal(body.data[0].subject, inquiry.subject)
  })

  test('filters inquiries by status when provided', async ({ client, assert }) => {
    const seed = `${Date.now()}-status`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const openInquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      status: 'OPEN',
      seed: `${seed}-open`,
    })

    await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      status: 'RESOLVED',
      seed: `${seed}-resolved`,
    })

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/inquiries?status=OPEN`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, openInquiry.id)
    assert.equal(body.data[0].status, 'OPEN')
  })

  test('denies listing inquiries for student not responsible for', async ({ client }) => {
    const seed = `${Date.now()}-deny-list`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const response = await client
      .get(`/api/v1/responsavel/students/${student.id}/inquiries`)
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('creates inquiry with initial message', async ({ client, assert }) => {
    const seed = `${Date.now()}-create`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const { levelAssignment } = await createEnrollmentFixtures(school.id, seed)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
      levelAssignmentId: levelAssignment.id,
    })

    const response = await client
      .post(`/api/v1/responsavel/students/${student.id}/inquiries`)
      .json({
        subject: 'Test Inquiry Subject',
        body: 'This is the initial message body',
      })
      .loginAs(responsible)

    response.assertStatus(201)
    const body = response.body()
    assert.equal(body.subject, 'Test Inquiry Subject')
    assert.equal(body.status, 'OPEN')
    assert.equal(body.studentId, student.id)
    assert.equal(body.createdByResponsibleId, responsible.id)
    assert.isArray(body.messages)
    assert.equal(body.messages.length, 1)
    assert.equal(body.messages[0].body, 'This is the initial message body')
    assert.equal(body.messages[0].authorType, 'RESPONSIBLE')

    const savedInquiry = await ParentInquiry.query()
      .where('id', body.id)
      .preload('messages')
      .firstOrFail()

    assert.equal(savedInquiry.messages.length, 1)
    assert.equal(savedInquiry.messages[0].body, 'This is the initial message body')
  })

  test('creates inquiry recipients for school staff', async ({ client, assert }) => {
    const seed = `${Date.now()}-recipients`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const director = await createUserWithRole('SCHOOL_DIRECTOR', `${seed}-director`, school.id)
    const { levelAssignment } = await createEnrollmentFixtures(school.id, seed)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
      levelAssignmentId: levelAssignment.id,
    })

    const response = await client
      .post(`/api/v1/responsavel/students/${student.id}/inquiries`)
      .json({
        subject: 'Inquiry with Recipients',
        body: 'Message body',
      })
      .loginAs(responsible)

    response.assertStatus(201)
    const body = response.body()
    assert.isArray(body.recipients)
    assert.isTrue(body.recipients.some((r: { userId: string }) => r.userId === director.id))

    const savedRecipients = await ParentInquiryRecipient.query()
      .where('inquiryId', body.id)
      .andWhere('userId', director.id)

    assert.equal(savedRecipients.length, 1)
    assert.equal(savedRecipients[0].userType, 'DIRECTOR')
  })

  test('denies creating inquiry for student not responsible for', async ({ client }) => {
    const seed = `${Date.now()}-deny-create`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)
    const { levelAssignment } = await createEnrollmentFixtures(school.id, seed)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
      levelAssignmentId: levelAssignment.id,
    })

    const response = await client
      .post(`/api/v1/responsavel/students/${student.id}/inquiries`)
      .json({
        subject: 'Unauthorized Inquiry',
        body: 'Should not be created',
      })
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('adds message to existing inquiry', async ({ client, assert }) => {
    const seed = `${Date.now()}-add-message`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/messages`)
      .json({
        body: 'This is a follow-up message',
      })
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.messages)
    assert.equal(body.messages.length, 2)
    assert.equal(body.messages[1].body, 'This is a follow-up message')
    assert.equal(body.messages[1].authorType, 'RESPONSIBLE')

    const messages = await ParentInquiryMessage.query()
      .where('inquiryId', inquiry.id)
      .orderBy('createdAt', 'asc')

    assert.equal(messages.length, 2)
    assert.equal(messages[1].body, 'This is a follow-up message')
  })

  test('denies adding message to inquiry not owned by responsible', async ({ client }) => {
    const seed = `${Date.now()}-deny-message`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/messages`)
      .json({
        body: 'Unauthorized message',
      })
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('denies adding message to resolved inquiry', async ({ client }) => {
    const seed = `${Date.now()}-resolved-message`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      status: 'RESOLVED',
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/messages`)
      .json({
        body: 'Should fail',
      })
      .loginAs(responsible)

    response.assertStatus(400)
  })

  test('resolves inquiry and sets resolvedAt and resolvedBy', async ({ client, assert }) => {
    const seed = `${Date.now()}-resolve`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/resolve`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.status, 'RESOLVED')
    assert.isNotNull(body.resolvedAt)
    assert.equal(body.resolvedBy, responsible.id)

    const savedInquiry = await ParentInquiry.findOrFail(inquiry.id)
    assert.equal(savedInquiry.status, 'RESOLVED')
    assert.isNotNull(savedInquiry.resolvedAt)
    assert.equal(savedInquiry.resolvedBy, responsible.id)
  })

  test('denies resolving inquiry not owned by responsible', async ({ client }) => {
    const seed = `${Date.now()}-deny-resolve`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/resolve`)
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('denies resolving already resolved inquiry', async ({ client }) => {
    const seed = `${Date.now()}-already-resolved`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      status: 'RESOLVED',
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/resolve`)
      .loginAs(responsible)

    response.assertStatus(400)
  })

  test('shows inquiry details for authorized responsible', async ({ client, assert }) => {
    const seed = `${Date.now()}-show`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .get(`/api/v1/responsavel/inquiries/${inquiry.id}`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.id, inquiry.id)
    assert.equal(body.subject, inquiry.subject)
    assert.equal(body.status, 'OPEN')
    assert.isArray(body.messages)
    assert.equal(body.messages.length, 1)
  })

  test('denies showing inquiry to non-responsible user', async ({ client }) => {
    const seed = `${Date.now()}-deny-show`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const response = await client
      .get(`/api/v1/responsavel/inquiries/${inquiry.id}`)
      .loginAs(otherResponsible)

    response.assertStatus(403)
  })

  test('marks inquiry as read and updates hasUnread for responsible', async ({
    client,
    assert,
  }) => {
    const seed = `${Date.now()}-mark-read`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const director = await createUserWithRole('SCHOOL_DIRECTOR', `${seed}-director`, school.id)

    const student = await createStudentWithResponsible({
      schoolId: school.id,
      responsibleId: responsible.id,
      seed: `${seed}-student`,
    })

    const inquiry = await createInquiryForStudent({
      studentId: student.id,
      responsibleId: responsible.id,
      schoolId: school.id,
      seed: `${seed}-inquiry`,
    })

    const showBeforeMarkRead = await client
      .get(`/api/v1/responsavel/inquiries/${inquiry.id}`)
      .loginAs(responsible)

    showBeforeMarkRead.assertStatus(200)
    assert.equal(showBeforeMarkRead.body().hasUnread, true)

    const markReadResponse = await client
      .post(`/api/v1/responsavel/inquiries/${inquiry.id}/mark-read`)
      .loginAs(responsible)

    markReadResponse.assertStatus(204)

    const readStatus = await ParentInquiryReadStatus.query()
      .where('inquiryId', inquiry.id)
      .where('userId', responsible.id)
      .first()

    assert.isNotNull(readStatus)

    const showAfterMarkRead = await client
      .get(`/api/v1/responsavel/inquiries/${inquiry.id}`)
      .loginAs(responsible)

    showAfterMarkRead.assertStatus(200)
    assert.equal(showAfterMarkRead.body().hasUnread, false)

    await ParentInquiryMessage.create({
      inquiryId: inquiry.id,
      authorId: director.id,
      authorType: 'DIRECTOR',
      body: 'Nova resposta da escola',
    })

    const showAfterNewMessage = await client
      .get(`/api/v1/responsavel/inquiries/${inquiry.id}`)
      .loginAs(responsible)

    showAfterNewMessage.assertStatus(200)
    assert.equal(showAfterNewMessage.body().hasUnread, true)
  })
})
