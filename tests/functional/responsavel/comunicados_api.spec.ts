import { test } from '@japa/runner'
import '@japa/api-client'
import '#config/auth'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Role from '#models/role'
import School from '#models/school'
import User from '#models/user'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementAttachment from '#models/school_announcement_attachment'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'

async function createUserWithRole(roleName: string, seed: string) {
  const role = await Role.firstOrCreate({ name: roleName }, { name: roleName })

  const user = await User.create({
    name: `${roleName} User ${seed}`,
    slug: `${roleName.toLowerCase()}-${seed}`,
    email: `${roleName.toLowerCase()}-${seed}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })

  return user
}

async function createAnnouncementForResponsible(params: {
  schoolId: string
  creatorId: string
  responsibleId: string
  status?: 'DRAFT' | 'PUBLISHED'
  requiresAcknowledgement?: boolean
  acknowledgementDueAt?: DateTime | null
  acknowledgedAt?: DateTime | null
  titleSeed: string
}) {
  const announcement = await SchoolAnnouncement.create({
    schoolId: params.schoolId,
    title: `Comunicado ${params.titleSeed}`,
    body: `Texto ${params.titleSeed}`,
    status: params.status ?? 'PUBLISHED',
    publishedAt: params.status === 'DRAFT' ? null : DateTime.now(),
    requiresAcknowledgement: params.requiresAcknowledgement ?? true,
    acknowledgementDueAt: params.acknowledgementDueAt ?? DateTime.now().plus({ days: 1 }),
    createdByUserId: params.creatorId,
  })

  const recipient = await SchoolAnnouncementRecipient.create({
    announcementId: announcement.id,
    responsibleId: params.responsibleId,
    studentId: null,
    notificationId: null,
    acknowledgedAt: params.acknowledgedAt ?? null,
  })

  return { announcement, recipient }
}

test.group('Responsavel comunicados API', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('keeps comunicados endpoint protected for unauthenticated requests', async ({ client }) => {
    const response = await client.get('/api/v1/responsavel/comunicados').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('lists only published comunicados for authenticated responsible', async ({
    client,
    assert,
  }) => {
    const seed = Date.now().toString()
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const creator = await createUserWithRole('DIRECTOR', `${seed}-creator`)
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)
    const otherResponsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-other`)

    const included = await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      status: 'PUBLISHED',
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().plus({ days: 2 }),
      titleSeed: `${seed}-included`,
    })

    await SchoolAnnouncementAttachment.create({
      announcementId: included.announcement.id,
      fileName: 'boletim.pdf',
      filePath: `school-announcements/${included.announcement.id}/boletim.pdf`,
      file: `school-announcements/${included.announcement.id}/boletim.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: 12345,
      position: 0,
    })

    await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      status: 'DRAFT',
      titleSeed: `${seed}-draft`,
    })

    await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: otherResponsible.id,
      status: 'PUBLISHED',
      titleSeed: `${seed}-other-responsible`,
    })

    const response = await client.get('/api/v1/responsavel/comunicados').loginAs(responsible)
    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, included.announcement.id)
    assert.equal(body.data[0].acknowledgementStatus, 'PENDING_ACK')
    assert.isArray(body.data[0].attachments)
    assert.equal(body.data[0].attachments.length, 1)
    assert.equal(body.data[0].attachments[0].fileName, 'boletim.pdf')
    assert.isString(body.data[0].attachments[0].fileUrl)
  })

  test('returns comunicado details with acknowledgement status', async ({ client, assert }) => {
    const seed = `${Date.now()}-details`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const creator = await createUserWithRole('DIRECTOR', `${seed}-creator`)
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const target = await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().plus({ days: 1 }),
      titleSeed: `${seed}-target`,
    })

    const response = await client
      .get(`/api/v1/responsavel/comunicados/${target.announcement.id}`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.id, target.announcement.id)
    assert.equal(body.acknowledgementStatus, 'PENDING_ACK')
  })

  test('lists only pending acknowledgements that are not expired', async ({ client, assert }) => {
    const seed = `${Date.now()}-pending`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const creator = await createUserWithRole('DIRECTOR', `${seed}-creator`)
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const pending = await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().plus({ days: 1 }),
      titleSeed: `${seed}-pending`,
    })

    await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().minus({ days: 1 }),
      titleSeed: `${seed}-expired`,
    })

    await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().plus({ days: 1 }),
      acknowledgedAt: DateTime.now(),
      titleSeed: `${seed}-acknowledged`,
    })

    const response = await client
      .get('/api/v1/responsavel/comunicados/pending-ack')
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.length, 1)
    assert.equal(body[0].id, pending.announcement.id)
  })

  test('acknowledges a required comunicado and persists acknowledgedAt', async ({
    client,
    assert,
  }) => {
    const seed = `${Date.now()}-ack`
    const school = await School.create({ name: `School ${seed}`, slug: `school-${seed}` })
    const creator = await createUserWithRole('DIRECTOR', `${seed}-creator`)
    const responsible = await createUserWithRole('STUDENT_RESPONSIBLE', `${seed}-resp`)

    const target = await createAnnouncementForResponsible({
      schoolId: school.id,
      creatorId: creator.id,
      responsibleId: responsible.id,
      requiresAcknowledgement: true,
      acknowledgementDueAt: DateTime.now().plus({ days: 3 }),
      titleSeed: `${seed}-target`,
    })

    const response = await client
      .post(`/api/v1/responsavel/comunicados/${target.announcement.id}/acknowledge`)
      .loginAs(responsible)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.announcementId, target.announcement.id)
    assert.isNotNull(body.acknowledgedAt)

    const recipient = await SchoolAnnouncementRecipient.query()
      .where('announcementId', target.announcement.id)
      .where('responsibleId', responsible.id)
      .firstOrFail()

    assert.isNotNull(recipient.acknowledgedAt)
  })
})
