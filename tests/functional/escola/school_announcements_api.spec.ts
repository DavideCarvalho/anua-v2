import { test } from '@japa/runner'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import Student from '#models/student'
import Class_ from '#models/class'
import StudentHasResponsible from '#models/student_has_responsible'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'
import Notification from '#models/notification'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

async function createResponsibleUser(seed: string) {
  const role = await Role.firstOrCreate(
    { name: 'STUDENT_RESPONSIBLE' },
    { name: 'STUDENT_RESPONSIBLE' }
  )

  return User.create({
    name: `Responsible ${seed}`,
    slug: `responsible-${seed}`,
    email: `responsible-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
}

async function createStudentWithClassAndResponsible(params: {
  schoolId: string
  seed: string
  responsibleId: string
}) {
  const studentRole = await Role.firstOrCreate({ name: 'STUDENT' }, { name: 'STUDENT' })

  const classEntity = await Class_.create({
    name: `Turma ${params.seed}`,
    schoolId: params.schoolId,
    levelId: null,
    isArchived: false,
  })

  const studentUser = await User.create({
    name: `Aluno ${params.seed}`,
    slug: `aluno-${params.seed}`,
    email: `aluno-${params.seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: studentRole.id,
  })

  await Student.create({
    id: studentUser.id,
    descountPercentage: 0,
    monthlyPaymentAmount: 0,
    isSelfResponsible: false,
    paymentDate: null,
    classId: classEntity.id,
    contractId: null,
    canteenLimit: 0,
    balance: 0,
    enrollmentStatus: 'REGISTERED',
  })

  await StudentHasResponsible.create({
    studentId: studentUser.id,
    responsibleId: params.responsibleId,
    isPedagogical: true,
    isFinancial: true,
  })

  return { classEntity, studentUser }
}

test.group('School announcements API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('keeps school announcements endpoint protected for unauthenticated requests', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/school-announcements').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('creates a draft announcement and lists it for the school user', async ({
    client,
    assert,
  }) => {
    const { user } = await createEscolaAuthUser()
    const seed = Date.now().toString()

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Corpo do comunicado',
        requiresAcknowledgement: true,
        acknowledgementDueAt: DateTime.now().plus({ days: 2 }).toJSDate(),
        audienceClassIds: [],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(201)
    const createBody = createResponse.body()
    assert.equal(createBody.status, 'DRAFT')
    assert.equal(createBody.requiresAcknowledgement, true)

    const listResponse = await client
      .get('/api/v1/school-announcements')
      .withGuard('web')
      .loginAs(user)
    listResponse.assertStatus(200)

    const listBody = listResponse.body()
    assert.equal(listBody.data.length, 1)
    assert.equal(listBody.data[0].id, createBody.id)
  })

  test('rejects publish when announcement has no audience selected', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const seed = `${Date.now()}-no-audience`

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Sem publico',
        audienceClassIds: [],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(201)
    const created = createResponse.body()

    const publishResponse = await client
      .post(`/api/v1/school-announcements/${created.id}/publish`)
      .loginAs(user)

    publishResponse.assertStatus(400)
    assert.include(publishResponse.text(), 'Selecione pelo menos um')
  })

  test('publishes with class audience and creates recipient notification', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-publish`
    const responsible = await createResponsibleUser(seed)
    const { classEntity } = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Publicar para turma',
        requiresAcknowledgement: true,
        acknowledgementDueAt: DateTime.now().plus({ days: 5 }).toJSDate(),
        audienceClassIds: [classEntity.id],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(201)
    const created = createResponse.body()

    const publishResponse = await client
      .post(`/api/v1/school-announcements/${created.id}/publish`)
      .loginAs(user)

    publishResponse.assertStatus(200)
    const published = publishResponse.body()
    assert.equal(published.status, 'PUBLISHED')

    const recipient = await SchoolAnnouncementRecipient.query()
      .where('announcementId', created.id)
      .where('responsibleId', responsible.id)
      .first()

    assert.isNotNull(recipient)
    assert.isNotNull(recipient?.notificationId)

    const notification = await Notification.find(recipient!.notificationId!)
    assert.isNotNull(notification)
    assert.equal(notification?.type, 'SYSTEM_ANNOUNCEMENT')

    const persisted = await SchoolAnnouncement.findOrFail(created.id)
    assert.equal(persisted.status, 'PUBLISHED')
  })

  test('rejects publishing an announcement that is already published', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-republish`
    const responsible = await createResponsibleUser(seed)
    const { classEntity } = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Primeira publicacao',
        audienceClassIds: [classEntity.id],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(201)
    const created = createResponse.body()

    const firstPublish = await client
      .post(`/api/v1/school-announcements/${created.id}/publish`)
      .loginAs(user)
    firstPublish.assertStatus(200)

    const secondPublish = await client
      .post(`/api/v1/school-announcements/${created.id}/publish`)
      .loginAs(user)

    secondPublish.assertStatus(400)
    assert.include(secondPublish.text(), 'já foi publicado')
  })

  test('rejects creating announcement with class audience from another school', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-invalid-class`
    const otherSchool = await School.create({
      name: `Outra escola ${seed}`,
      slug: `outra-escola-${seed}`,
    })
    const outsiderClass = await Class_.create({
      name: `Turma externa ${seed}`,
      schoolId: otherSchool.id,
      levelId: null,
      isArchived: false,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Publico invalido',
        audienceClassIds: [outsiderClass.id],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(400)
    assert.include(createResponse.text(), 'Turma inválida para a escola selecionada')

    const count = await SchoolAnnouncement.query().where('schoolId', school.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 0)
  })
})
