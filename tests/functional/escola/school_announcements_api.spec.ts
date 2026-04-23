import { test } from '@japa/runner'
import '@japa/api-client'
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
import SchoolAnnouncementAttachment from '#models/school_announcement_attachment'
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

  test('creates a draft announcement with student audience ids', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-student-audience`
    const responsible = await createResponsibleUser(seed)
    const { studentUser } = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Publico por aluno',
        audienceStudentIds: [studentUser.id],
      })

    createResponse.assertStatus(201)
    const createBody = createResponse.body()
    assert.equal(createBody.status, 'DRAFT')
    assert.isArray(createBody.audiences)
    assert.isTrue(
      createBody.audiences.some(
        (audience: { scopeType: string; scopeId: string }) =>
          audience.scopeType === 'STUDENT' && audience.scopeId === studentUser.id
      )
    )
  })

  test('rejects creating announcement with student audience from another school', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-invalid-student`
    const otherSchool = await School.create({
      name: `Outra escola ${seed}`,
      slug: `outra-escola-student-${seed}`,
    })
    const responsible = await createResponsibleUser(`${seed}-responsible`)
    const { studentUser } = await createStudentWithClassAndResponsible({
      schoolId: otherSchool.id,
      seed: `${seed}-student`,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Aluno de outra escola',
        audienceStudentIds: [studentUser.id],
      })

    createResponse.assertStatus(400)
    assert.include(createResponse.text(), 'Aluno inválido para a escola selecionada')

    const count = await SchoolAnnouncement.query().where('schoolId', school.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 0)
  })

  test('lists students for announcement audience only from selected school', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-list-students`

    const schoolResponsible = await createResponsibleUser(`${seed}-school`)
    const outsideResponsible = await createResponsibleUser(`${seed}-outside`)

    const schoolStudent = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed: `${seed}-in-school`,
      responsibleId: schoolResponsible.id,
    })

    const otherSchool = await School.create({
      name: `Outra escola ${seed}`,
      slug: `outra-escola-list-${seed}`,
    })

    const outsideStudent = await createStudentWithClassAndResponsible({
      schoolId: otherSchool.id,
      seed: `${seed}-outside-school`,
      responsibleId: outsideResponsible.id,
    })

    const response = await client
      .get('/api/v1/school-announcements/audience/students')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body.data)
    assert.isTrue(
      body.data.some((item: { id: string }) => item.id === schoolStudent.studentUser.id)
    )
    assert.isFalse(
      body.data.some((item: { id: string }) => item.id === outsideStudent.studentUser.id)
    )
  })

  test('updates draft audience to specific students', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-update-student-audience`
    const responsible = await createResponsibleUser(seed)
    const { classEntity, studentUser } = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Rascunho inicial',
        audienceClassIds: [classEntity.id],
      })

    createResponse.assertStatus(201)
    const created = createResponse.body()

    const updateResponse = await client
      .put(`/api/v1/school-announcements/${created.id}`)
      .loginAs(user)
      .json({
        audienceAcademicPeriodIds: [],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceClassIds: [],
        audienceStudentIds: [studentUser.id],
      })

    updateResponse.assertStatus(200)
    const updated = updateResponse.body()
    const audiences = updated.audiences as Array<{ scopeType: string; scopeId: string }>

    assert.isTrue(
      audiences.some(
        (audience) => audience.scopeType === 'STUDENT' && audience.scopeId === studentUser.id
      )
    )
    assert.isFalse(audiences.some((audience) => audience.scopeType === 'CLASS'))
  })

  test('returns attachments in school announcement list payload', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-attachments-list`

    const announcement = await SchoolAnnouncement.create({
      schoolId: school.id,
      title: `Comunicado ${seed}`,
      body: 'Com anexo',
      status: 'DRAFT',
      publishedAt: null,
      requiresAcknowledgement: false,
      acknowledgementDueAt: null,
      createdByUserId: user.id,
    })

    await SchoolAnnouncementAttachment.create({
      announcementId: announcement.id,
      fileName: 'arquivo.pdf',
      filePath: `school-announcements/${announcement.id}/arquivo.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: 1024,
      position: 0,
    })

    const response = await client.get('/api/v1/school-announcements').loginAs(user)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.equal(body.data[0].id, announcement.id)
    assert.isArray(body.data[0].attachments)
    assert.equal(body.data[0].attachments[0].fileName, 'arquivo.pdf')
  })

  test('creates announcement with multipart attachments', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()

    const response = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .field('title', 'Comunicado com anexo')
      .field('body', 'Mensagem com arquivo')
      .field('audienceClassIds[]', 'class-test-id')
      .file('attachments[]', Buffer.from('%PDF-1.4 test file'), {
        filename: 'teste.pdf',
        contentType: 'application/pdf',
      })

    response.assertStatus(400)
    assert.include(response.text(), 'Turma inválida')
  })

  test('deletes draft announcement', async ({ client, assert }) => {
    const { user } = await createEscolaAuthUser()
    const seed = `${Date.now()}-delete-draft`

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Rascunho para exclusao',
        audienceClassIds: [],
        audienceCourseIds: [],
        audienceLevelIds: [],
        audienceAcademicPeriodIds: [],
      })

    createResponse.assertStatus(201)
    const created = createResponse.body()

    const deleteResponse = await client
      .delete(`/api/v1/school-announcements/${created.id}`)
      .loginAs(user)

    deleteResponse.assertStatus(204)

    const persisted = await SchoolAnnouncement.find(created.id)
    assert.isNull(persisted)
  })

  test('rejects deleting published announcement', async ({ client, assert }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-delete-published`
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
        body: 'Publicar antes de excluir',
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

    const deleteResponse = await client
      .delete(`/api/v1/school-announcements/${created.id}`)
      .loginAs(user)

    deleteResponse.assertStatus(400)
    assert.include(deleteResponse.text(), 'Somente comunicados em rascunho podem ser excluídos')
  })

  test('publishes with specific student audience and creates recipient notification', async ({
    client,
    assert,
  }) => {
    const { user, school } = await createEscolaAuthUser()
    const seed = `${Date.now()}-publish-student-audience`
    const responsible = await createResponsibleUser(seed)
    const { studentUser } = await createStudentWithClassAndResponsible({
      schoolId: school.id,
      seed,
      responsibleId: responsible.id,
    })

    const createResponse = await client
      .post('/api/v1/school-announcements')
      .loginAs(user)
      .json({
        title: `Comunicado ${seed}`,
        body: 'Publicar para aluno especifico',
        audienceStudentIds: [studentUser.id],
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
  })
})
