import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Role from '#models/role'
import OtpCodeMail from '#mails/otp_code_mail'

const GENERIC_MESSAGE = 'Se o e-mail estiver cadastrado, enviaremos um codigo de acesso.'

function makeEmail(prefix: string) {
  return `${prefix}-${Date.now()}@example.com`
}

async function createActiveUser(email: string, birthDate: DateTime | null) {
  const role = await Role.create({ name: `role-${Date.now()}-${Math.random()}` })

  return User.create({
    name: `User ${Date.now()}`,
    slug: `user-${Date.now()}-${Math.random()}`,
    email,
    active: true,
    birthDate,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })
}

test.group('Auth send-code', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()

    return async () => {
      mail.restore()
      await db.rollbackGlobalTransaction()
    }
  })

  test('blocks otp for users age 14 or less with generic response', async ({ client, assert }) => {
    const email = makeEmail('young-user')

    await createActiveUser(email, DateTime.now().minus({ years: 14 }))

    const { mails } = mail.fake()

    const response = await client.post('/api/v1/auth/send-code').json({ email })

    response.assertStatus(200)
    assert.equal(response.body().message, GENERIC_MESSAGE)
    mails.assertNotSent(OtpCodeMail)
  })

  test('allows otp for users older than 14', async ({ client, assert }) => {
    const email = makeEmail('older-user')

    await createActiveUser(email, DateTime.now().minus({ years: 15 }))

    const { mails } = mail.fake()

    const response = await client.post('/api/v1/auth/send-code').json({ email })

    response.assertStatus(200)
    assert.equal(response.body().message, GENERIC_MESSAGE)
    mails.assertSent(OtpCodeMail)
  })

  test('allows otp when birthDate is missing', async ({ client, assert }) => {
    const email = makeEmail('no-birthdate-user')

    await createActiveUser(email, null)

    const { mails } = mail.fake()

    const response = await client.post('/api/v1/auth/send-code').json({ email })

    response.assertStatus(200)
    assert.equal(response.body().message, GENERIC_MESSAGE)
    mails.assertSent(OtpCodeMail)
  })

  test('keeps generic response for unknown email', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/send-code').json({
      email: makeEmail('unknown-user'),
    })

    response.assertStatus(200)
    assert.equal(response.body().message, GENERIC_MESSAGE)
  })
})
