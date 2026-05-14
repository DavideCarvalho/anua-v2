import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import type { ChatScope } from '#ai/chat_scope'
import {
  denyIfClassOutOfScope,
  denyIfStudentOutOfScope,
  denyIfResponsavelLacksPedagogicalAccess,
  denyIfResponsavelLacksFinancialAccess,
} from '#ai/scope_check'

async function startTx() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

function makeScope(overrides: Partial<ChatScope> = {}): ChatScope {
  return {
    role: 'professor',
    schoolId: 'school-1',
    classIds: [],
    subjectIds: [],
    studentIds: [],
    studentIdsPedagogical: [],
    studentIdsFinancial: [],
    ...overrides,
  }
}

test.group('scope_check: classes', (group) => {
  group.each.setup(startTx)

  test('gestor passa por qualquer classId', ({ assert }) => {
    const scope = makeScope({ role: 'gestor' })
    assert.isNull(denyIfClassOutOfScope(scope, 'qualquer-id'))
    assert.isNull(denyIfClassOutOfScope(scope, 'outro-id-aleatorio'))
  })

  test('professor passa quando o classId está no scope', ({ assert }) => {
    const scope = makeScope({ role: 'professor', classIds: ['c1', 'c2'] })
    assert.isNull(denyIfClassOutOfScope(scope, 'c1'))
    assert.isNull(denyIfClassOutOfScope(scope, 'c2'))
  })

  test('professor é bloqueado quando classId não está no scope', ({ assert }) => {
    const scope = makeScope({ role: 'professor', classIds: ['c1'] })
    const denial = denyIfClassOutOfScope(scope, 'c-fora')
    assert.isNotNull(denial)
    assert.include(denial!, 'turma')
  })

  test('coordenador segue mesma regra', ({ assert }) => {
    const scope = makeScope({ role: 'coordenador', classIds: ['c1'] })
    assert.isNull(denyIfClassOutOfScope(scope, 'c1'))
    assert.isNotNull(denyIfClassOutOfScope(scope, 'c-fora'))
  })

  test('responsavel sem classIds preenchido é bloqueado', ({ assert }) => {
    // Responsavel acessa via studentId; classId direto não é caminho válido.
    const scope = makeScope({ role: 'responsavel', classIds: [] })
    assert.isNotNull(denyIfClassOutOfScope(scope, 'qualquer'))
  })
})

test.group('scope_check: students', (group) => {
  group.each.setup(startTx)

  test('gestor passa por qualquer studentId', ({ assert }) => {
    const scope = makeScope({ role: 'gestor' })
    assert.isNull(denyIfStudentOutOfScope(scope, 'qualquer-aluno'))
  })

  test('responsavel passa quando studentId está vinculado', ({ assert }) => {
    const scope = makeScope({ role: 'responsavel', studentIds: ['filho-a', 'filho-b'] })
    assert.isNull(denyIfStudentOutOfScope(scope, 'filho-a'))
    assert.isNull(denyIfStudentOutOfScope(scope, 'filho-b'))
  })

  test('responsavel é bloqueado pra aluno que não é filho', ({ assert }) => {
    const scope = makeScope({ role: 'responsavel', studentIds: ['filho-a'] })
    const denial = denyIfStudentOutOfScope(scope, 'aluno-aleatorio')
    assert.isNotNull(denial)
    assert.include(denial!, 'aluno')
  })

  test('professor passa pra aluno cujo classId está no scope (studentIds pré-computado)', ({
    assert,
  }) => {
    // chat_scope.ts pré-computa studentIds via Student.classId IN classIds,
    // então no scope_check só conferimos a presença na lista.
    const scope = makeScope({
      role: 'professor',
      classIds: ['c1'],
      studentIds: ['aluno-da-c1'],
    })
    assert.isNull(denyIfStudentOutOfScope(scope, 'aluno-da-c1'))
  })

  test('professor é bloqueado pra aluno fora dos studentIds pré-computados', ({ assert }) => {
    const scope = makeScope({
      role: 'professor',
      classIds: ['c1'],
      studentIds: ['aluno-da-c1'],
    })
    assert.isNotNull(denyIfStudentOutOfScope(scope, 'aluno-de-outra-turma'))
  })
})

test.group('scope_check: responsável pedagógico × financeiro', (group) => {
  group.each.setup(startTx)

  test('gestor passa nos dois checks por qualquer aluno', ({ assert }) => {
    const scope = makeScope({ role: 'gestor' })
    assert.isNull(denyIfResponsavelLacksPedagogicalAccess(scope, 'qualquer'))
    assert.isNull(denyIfResponsavelLacksFinancialAccess(scope, 'qualquer'))
  })

  test('responsável com os dois flags passa em ambos', ({ assert }) => {
    const scope = makeScope({
      role: 'responsavel',
      studentIds: ['filho-x'],
      studentIdsPedagogical: ['filho-x'],
      studentIdsFinancial: ['filho-x'],
    })
    assert.isNull(denyIfResponsavelLacksPedagogicalAccess(scope, 'filho-x'))
    assert.isNull(denyIfResponsavelLacksFinancialAccess(scope, 'filho-x'))
  })

  test('responsável só pedagógico é bloqueado no financeiro com mensagem clara', ({ assert }) => {
    const scope = makeScope({
      role: 'responsavel',
      studentIds: ['filho-x'],
      studentIdsPedagogical: ['filho-x'],
      studentIdsFinancial: [],
    })
    assert.isNull(denyIfResponsavelLacksPedagogicalAccess(scope, 'filho-x'))
    const denial = denyIfResponsavelLacksFinancialAccess(scope, 'filho-x')
    assert.isNotNull(denial)
    assert.include(denial!, 'pedagógico')
    assert.include(denial!, 'financeiro')
  })

  test('responsável só financeiro é bloqueado no pedagógico com mensagem clara', ({ assert }) => {
    const scope = makeScope({
      role: 'responsavel',
      studentIds: ['filho-x'],
      studentIdsPedagogical: [],
      studentIdsFinancial: ['filho-x'],
    })
    assert.isNull(denyIfResponsavelLacksFinancialAccess(scope, 'filho-x'))
    const denial = denyIfResponsavelLacksPedagogicalAccess(scope, 'filho-x')
    assert.isNotNull(denial)
    assert.include(denial!, 'financeiro')
    assert.include(denial!, 'pedagógico')
  })

  test('responsável é bloqueado em ambos pra aluno sem vínculo', ({ assert }) => {
    const scope = makeScope({
      role: 'responsavel',
      studentIds: ['filho-x'],
      studentIdsPedagogical: ['filho-x'],
      studentIdsFinancial: ['filho-x'],
    })
    const ped = denyIfResponsavelLacksPedagogicalAccess(scope, 'aluno-aleatorio')
    const fin = denyIfResponsavelLacksFinancialAccess(scope, 'aluno-aleatorio')
    assert.isNotNull(ped)
    assert.isNotNull(fin)
    assert.include(ped!, 'aluno')
    assert.include(fin!, 'aluno')
  })

  test('flags por filho são independentes: pedagógico-A + financeiro-B', ({ assert }) => {
    // Caso real do banco (Lorena na Silva Gomes): Celia é pedagógica,
    // Leandro é financeiro, ambos compartilham vínculo via filhos distintos.
    // Aqui simulamos o mesmo padrão: filho-A só pedagógico, filho-B só
    // financeiro pro mesmo usuário.
    const scope = makeScope({
      role: 'responsavel',
      studentIds: ['filho-A', 'filho-B'],
      studentIdsPedagogical: ['filho-A'],
      studentIdsFinancial: ['filho-B'],
    })
    // Pedagógico do A: ok. Pedagógico do B: bloqueado.
    assert.isNull(denyIfResponsavelLacksPedagogicalAccess(scope, 'filho-A'))
    assert.isNotNull(denyIfResponsavelLacksPedagogicalAccess(scope, 'filho-B'))
    // Financeiro do A: bloqueado. Financeiro do B: ok.
    assert.isNotNull(denyIfResponsavelLacksFinancialAccess(scope, 'filho-A'))
    assert.isNull(denyIfResponsavelLacksFinancialAccess(scope, 'filho-B'))
  })
})
