import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { personaFromRole, resolvePersonaId } from '#ai/chat_role'

// Testes puros (sem DB) mas mantemos o protocolo de transação que o
// bootstrap exige pra todo spec — começa/rollback são no-op aqui.
test.group('chat_role: personaFromRole', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('mapeia role de diretor pra gestor', ({ assert }) => {
    assert.equal(personaFromRole('SCHOOL_DIRECTOR'), 'gestor')
    assert.equal(personaFromRole('SCHOOL_ADMIN'), 'gestor')
    assert.equal(personaFromRole('SCHOOL_ADMINISTRATIVE'), 'gestor')
    assert.equal(personaFromRole('SCHOOL_BOARD'), 'gestor')
    assert.equal(personaFromRole('ADMIN'), 'gestor')
    assert.equal(personaFromRole('SUPER_ADMIN'), 'gestor')
  })

  test('mapeia coordenador, professor e responsavel', ({ assert }) => {
    assert.equal(personaFromRole('SCHOOL_COORDINATOR'), 'coordenador')
    assert.equal(personaFromRole('SCHOOL_TEACHER'), 'professor')
    assert.equal(personaFromRole('STUDENT_RESPONSIBLE'), 'responsavel')
    assert.equal(personaFromRole('RESPONSIBLE'), 'responsavel')
  })

  test('rejeita roles desconhecidas, null e undefined', ({ assert }) => {
    assert.isNull(personaFromRole('STUDENT'))
    assert.isNull(personaFromRole('STORE_OWNER'))
    assert.isNull(personaFromRole('UNKNOWN_ROLE'))
    assert.isNull(personaFromRole(null))
    assert.isNull(personaFromRole(undefined))
    assert.isNull(personaFromRole(''))
  })
})

test.group('chat_role: resolvePersonaId override', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return async () => {
      await db.rollbackGlobalTransaction()
    }
  })

  test('gestor pode trocar pra comunicador', ({ assert }) => {
    assert.equal(resolvePersonaId('gestor', 'comunicador'), 'comunicador')
    assert.equal(resolvePersonaId('gestor', 'gestor'), 'gestor')
  })

  test('gestor ignora override pra persona não-permitida', ({ assert }) => {
    assert.equal(resolvePersonaId('gestor', 'professor'), 'gestor')
    assert.equal(resolvePersonaId('gestor', 'coordenador'), 'gestor')
    assert.equal(resolvePersonaId('gestor', 'responsavel'), 'gestor')
    assert.equal(resolvePersonaId('gestor', 'random'), 'gestor')
  })

  test('coordenador/professor/responsavel ignoram qualquer override — persona fixa', ({
    assert,
  }) => {
    assert.equal(resolvePersonaId('coordenador', 'gestor'), 'coordenador')
    assert.equal(resolvePersonaId('professor', 'gestor'), 'professor')
    assert.equal(resolvePersonaId('responsavel', 'gestor'), 'responsavel')
    assert.equal(resolvePersonaId('professor', 'comunicador'), 'professor')
  })

  test('sem override usa o default', ({ assert }) => {
    assert.equal(resolvePersonaId('gestor', undefined), 'gestor')
    assert.equal(resolvePersonaId('professor', undefined), 'professor')
  })
})
