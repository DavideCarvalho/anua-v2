import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { personas } from '#ai/personas'
import { toolRegistry } from '#ai/tool_registry'
import type { ChatScope } from '#ai/chat_scope'
import '#ai/tools/index'

async function startTx() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

function emptyScope(role: ChatScope['role']): ChatScope {
  return {
    role,
    schoolId: 'school-fixture',
    classIds: [],
    subjectIds: [],
    studentIds: [],
  }
}

const ROLE_PERSONAS = ['gestor', 'comunicador', 'coordenador', 'professor', 'responsavel'] as const

test.group('personas: allowedTools batem com o registry', (group) => {
  group.each.setup(startTx)

  for (const personaId of ROLE_PERSONAS) {
    test(`${personaId}: cada tool registrada está em allowedTools`, ({ assert }) => {
      const persona = personas[personaId]
      // chat_role só faz override pra gestor; pra os outros, o role do scope
      // coincide com o personaId — só converte 'comunicador' que usa gestor scope.
      const scopeRole = personaId === 'comunicador' ? 'gestor' : personaId
      const tools = toolRegistry.forPersona(personaId, {
        schoolId: 'school-fixture',
        userId: 'user-fixture',
        scope: emptyScope(scopeRole),
      })
      const registered = Object.keys(tools).sort()
      const declared = [...persona.allowedTools].sort()

      assert.deepEqual(
        registered,
        declared,
        `${personaId}: registry=${registered.join(',')} != allowedTools=${declared.join(',')}`
      )
    })
  }
})

test.group('personas: tools sensíveis ficam restritas', (group) => {
  group.each.setup(startTx)

  test('queryDatabase/getSchema só em gestor e comunicador', ({ assert }) => {
    const sensitive = ['queryDatabase', 'getSchema']
    for (const tool of sensitive) {
      for (const role of ['coordenador', 'professor', 'responsavel'] as const) {
        assert.notInclude(personas[role].allowedTools, tool, `${role} não pode ter ${tool}`)
      }
    }
    assert.include(personas.gestor.allowedTools, 'queryDatabase')
    assert.include(personas.comunicador.allowedTools, 'queryDatabase')
  })

  test('getStudentFinancials só em gestor e responsavel', ({ assert }) => {
    assert.include(personas.gestor.allowedTools, 'getStudentFinancials')
    assert.include(personas.responsavel.allowedTools, 'getStudentFinancials')
    assert.notInclude(personas.coordenador.allowedTools, 'getStudentFinancials')
    assert.notInclude(personas.professor.allowedTools, 'getStudentFinancials')
  })

  test('getMyChildren só em responsavel', ({ assert }) => {
    assert.include(personas.responsavel.allowedTools, 'getMyChildren')
    for (const role of ['gestor', 'comunicador', 'coordenador', 'professor'] as const) {
      assert.notInclude(personas[role].allowedTools, 'getMyChildren')
    }
  })

  test('getSchoolStats/getStudentAlerts só em gestor e comunicador', ({ assert }) => {
    const sensitive = ['getSchoolStats', 'getStudentAlerts']
    for (const tool of sensitive) {
      for (const role of ['coordenador', 'professor', 'responsavel'] as const) {
        // getStudentAlerts existe em comunicador também
        assert.notInclude(personas[role].allowedTools, tool, `${role} não pode ter ${tool}`)
      }
    }
  })
})

test.group('personas: system prompts cobrem regras', (group) => {
  group.each.setup(startTx)

  test('SHARED_RULES aparecem nos 5 prompts', ({ assert }) => {
    const ctx = {
      school: { id: 'school-x', name: 'Escola Teste' },
      user: { id: 'user-x', name: 'Fulano' },
      currentDate: '2026-05-14',
      scope: emptyScope('gestor'),
    }

    for (const personaId of ROLE_PERSONAS) {
      const prompt = personas[personaId].systemPrompt(ctx)
      assert.include(prompt, 'NUNCA invente', `${personaId} prompt deve ter NUNCA invente`)
    }
  })

  test('prompt do responsavel menciona isFinancial e múltiplos filhos', ({ assert }) => {
    const ctx = {
      school: { id: 's1', name: 'X' },
      user: { id: 'u1', name: 'Mãe' },
      currentDate: '2026-05-14',
      scope: { ...emptyScope('responsavel'), studentIds: ['a', 'b'] },
    }
    const prompt = personas.responsavel.systemPrompt(ctx)
    assert.include(prompt, 'isFinancial')
    assert.include(prompt, 'confirme com o usuário de qual filho')
  })
})
