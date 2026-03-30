import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

function registerPageTests(path: string) {
  test(`redirects unauthenticated request to ${path}`, async ({ visit }) => {
    const page = await visit(path, { timeout: 60_000 })
    await page.assertPath('/login')
  })

  test(`returns page for authenticated user: ${path}`, async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)
    const page = await visit(path, { timeout: 60_000 })
    await page.assertPathContains(path.replace(/^\//, ''))
  })
}

test.group('Escola pedagogico - Turmas (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/turmas')
})

test.group('Escola pedagogico - Grade (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/grade')
  registerPageTests('/escola/pedagogico/horarios')
  registerPageTests('/escola/pedagogico/quadro')
})

test.group('Escola pedagogico - Registro diário (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/registro-diario')
})

test.group('Escola pedagogico - Atividades (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/atividades')
  registerPageTests(`/escola/pedagogico/atividades/${FAKE_UUID}`)
  registerPageTests(`/escola/pedagogico/atividades/${FAKE_UUID}/editar`)
})

test.group('Escola pedagogico - Provas (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/provas')
  registerPageTests(`/escola/pedagogico/provas/${FAKE_UUID}`)
  registerPageTests(`/escola/pedagogico/provas/${FAKE_UUID}/editar`)
})

test.group('Escola pedagogico - Presença (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/presenca')
})

test.group('Escola pedagogico - Aulas avulsas (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/aulas-avulsas')
})

test.group('Escola pedagogico - Cursos e níveis (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/pedagogico/cursos-niveis')
})
