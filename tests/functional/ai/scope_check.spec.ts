import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import type { ChatScope } from '#ai/chat_scope'
import { denyIfClassOutOfScope, denyIfStudentOutOfScope } from '#ai/scope_check'

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
