# Plano de cobertura de testes - APIs e fluxos

## Situação atual

- **Páginas**: redirect + auth ok (83 testes)
- **APIs**: só auth em 3 endpoints (students, attendance/class/students, classes/student-status)
- **Auth send-code**: bem coberto (4 cenários)

## Prioridade 1 - APIs críticas (escola)

| API             | Endpoints                          | Cenários                                       | Esforço |
| --------------- | ---------------------------------- | ---------------------------------------------- | ------- |
| **Students**    | GET /, GET /:id, POST /            | auth, list vazio, list com dados, filtros, 404 | M       |
| **Attendance**  | GET class/:id/students, POST batch | auth, 200 com dados, 404 class inválida        | M       |
| **Occurrences** | GET /, POST /                      | auth, list, create validação                   | M       |
| **Classes**     | GET /, GET /:id/student-status     | auth, 200, 404                                 | S       |

## Prioridade 2 - Autorização e edge cases

| Cenário         | Descrição                            | Onde              |
| --------------- | ------------------------------------ | ----------------- |
| User sem escola | requireSchool middleware             | Páginas escola    |
| SCHOOL_TEACHER  | Acesso limitado (só pedagógico)      | Páginas + APIs    |
| Escola errada   | Usuário acessa dados de outra escola | APIs com schoolId |
| UUID inválido   | 404 ou 422                           | APIs com :id      |

## Prioridade 3 - Fluxos completos

| Fluxo                   | Testes                           |
| ----------------------- | -------------------------------- |
| Listar alunos da escola | GET /students?schoolId=X → 200   |
| Registrar presença      | POST /attendance/batch → 201     |
| Criar ocorrência        | POST /occurrences → 201          |
| Criar comunicado        | POST /school-announcements → 201 |

## Estrutura proposta

```
tests/functional/
├── api/
│   ├── students_api.spec.ts      # expandir: list, show, auth
│   ├── attendance_api.spec.ts    # expandir: class students, batch
│   ├── occurrences_api.spec.ts   # novo: list, create
│   └── classes_api.spec.ts       # novo: student-status
├── pages/
│   └── ... (já existem)
└── helpers/
    ├── escola_auth.ts
    └── api_client.ts             # client.get().loginAs(user)
```

## Padrão por API

```ts
// 1. Auth (obrigatório)
test('redirects unauthenticated request', async ({ client }) => { ... })

// 2. Sucesso com dados
test('returns 200 with data for authenticated user', async ({ client }) => {
  const { user } = await createEscolaAuthUser()
  const res = await client.get('/api/v1/students').loginAs(user)
  res.assertStatus(200)
  assert.isArray(res.body().data)
})

// 3. Validação (POST)
test('returns 422 for invalid payload', async ({ client }) => { ... })

// 4. 404 (recurso inexistente)
test('returns 404 for non-existent resource', async ({ client }) => { ... })
```

## Ordem de implementação

1. **Students API** - expandir o existente (list autenticado, show, filtros)
2. **Attendance API** - expandir (class students com auth, batch)
3. **Occurrences API** - criar novo spec
4. **Classes API** - student-status com auth
5. **Helpers** - extrair createEscolaAuthUser + apiClient pattern
6. **Edge cases** - user sem escola, SCHOOL_TEACHER

## Estimativa

- Prioridade 1: ~4-6 horas
- Prioridade 2: ~2-3 horas
- Prioridade 3: ~2-4 horas
