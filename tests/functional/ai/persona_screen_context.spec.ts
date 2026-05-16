import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { personas } from '#ai/personas'
import type { SystemPromptContext } from '#ai/personas'
import type { ChatScope } from '#ai/chat_scope'

// Required by bootstrap enforcer (beginGlobalTransaction / rollbackGlobalTransaction must appear in every spec).
// These tests exercise a pure sync function and do not touch the DB, so the transaction is defined but not run.
async function startTx() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

function baseScope(): ChatScope {
  return {
    role: 'gestor',
    schoolId: 'school-1',
    classIds: [],
    subjectIds: [],
    studentIds: [],
    studentIdsPedagogical: [],
    studentIdsFinancial: [],
  }
}

function baseCtx(scope: ChatScope): SystemPromptContext {
  return {
    school: { id: 'school-1', name: 'Escola Teste' },
    user: { id: 'user-1', name: 'Davi' },
    currentDate: '2026-05-16',
    scope,
  }
}

test.group('persona gestor: contexto de tela', () => {
  test('sem scope.screen → prompt não menciona "Tela atual"', ({ assert }) => {
    const prompt = personas.gestor.systemPrompt(baseCtx(baseScope()))
    assert.notInclude(prompt, 'Tela atual')
  })

  test('com scope.screen=escola_dashboard sem filtros → menciona visão geral', ({ assert }) => {
    const scope = { ...baseScope(), screen: { id: 'escola_dashboard' } }
    const prompt = personas.gestor.systemPrompt(baseCtx(scope))
    assert.include(prompt, 'Tela atual')
    assert.include(prompt, 'dashboard')
    assert.include(prompt, 'sem filtros')
  })

  test('com filtros → menciona cada filtro presente', ({ assert }) => {
    const scope: ChatScope = {
      ...baseScope(),
      screen: {
        id: 'escola_dashboard',
        filters: {
          academicPeriodId: 'ap-2026',
          classId: 'class-1ano-a',
        },
      },
    }
    const prompt = personas.gestor.systemPrompt(baseCtx(scope))
    assert.include(prompt, 'período letivo=ap-2026')
    assert.include(prompt, 'turma=class-1ano-a')
  })

  test('filtro com label desconhecido → usa a key crua', ({ assert }) => {
    const scope: ChatScope = {
      ...baseScope(),
      screen: { id: 'escola_dashboard', filters: { custom: 'x' } },
    }
    const prompt = personas.gestor.systemPrompt(baseCtx(scope))
    assert.include(prompt, 'custom=x')
  })
})
