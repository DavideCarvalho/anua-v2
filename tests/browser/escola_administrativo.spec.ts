import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { createEscolaAuthUser } from '#tests/helpers/escola_auth'

const FAKE_UUID = '11111111-1111-4111-8111-111111111111'

function registerPageTests(path: string) {
  test(`redirects unauthenticated request to ${path}`, async ({ visit }) => {
    const page = await visit(path)
    await page.assertPath('/login')
  })

  test(`returns page for authenticated user: ${path}`, async ({ visit, browserContext }) => {
    const { user } = await createEscolaAuthUser()
    await browserContext.loginAs(user)
    const page = await visit(path)
    await page.assertPathContains(path.replace(/^\//, ''))
  })
}

test.group('Escola administrativo - Alunos (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/alunos')
  registerPageTests('/escola/administrativo/alunos/historico-financeiro')
  registerPageTests(`/escola/administrativo/alunos/${FAKE_UUID}/editar`)
})

test.group('Escola administrativo - Funcionários (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/funcionarios')
})

test.group('Escola administrativo - Professores (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/professores')
})

test.group('Escola administrativo - Matrículas (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/matriculas')
  registerPageTests('/escola/administrativo/matriculas/nova')
})

test.group('Escola administrativo - Contratos (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/contratos')
  registerPageTests('/escola/administrativo/contratos/novo')
  registerPageTests(`/escola/administrativo/contratos/${FAKE_UUID}/editar`)
  registerPageTests(`/escola/administrativo/contratos/${FAKE_UUID}/assinaturas`)
  registerPageTests(`/escola/administrativo/contratos/${FAKE_UUID}/docuseal`)
  registerPageTests(`/escola/administrativo/contratos/${FAKE_UUID}/financeiro`)
})

test.group('Escola administrativo - Bolsas (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/bolsas')
})

test.group('Escola administrativo - Parceiros (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/parceiros')
})

test.group('Escola administrativo - Matérias (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/materias')
})

test.group('Escola administrativo - Folha de ponto (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/folha-de-ponto')
})

test.group('Escola administrativo - Impressão (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/impressao')
})

test.group('Escola administrativo - Solicitações de compra (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/solicitacoes-de-compra')
})

test.group('Escola administrativo - Períodos letivos (browser)', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  registerPageTests('/escola/administrativo/periodos-letivos/novo-periodo-letivo')
  registerPageTests(`/escola/administrativo/periodos-letivos/${FAKE_UUID}/editar`)
})
