# Ask Anuá — Sheet contextual no /escola — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar botão "Perguntar ao Anuá" no header de `/escola` que abre um Sheet lateral com chat AI contextualizado — sabendo a tela atual e os filtros aplicados pelo gestor — reutilizando toda a infra de AI existente.

**Architecture:**

- Backend: nova coluna `surface` em `ai_threads` (page|sheet) + campo opcional `screen` no `ChatScope`. `chat_controller` aceita ambos via body; `list_threads_controller` filtra `surface='page'`. Persona gestor lê `scope.screen` e anexa contexto ao system prompt.
- Frontend: novo container `AskAnuaSheet` que envolve `AiChatPane` (com novas props `hideHeader`/`screen`/`surface`/`suggestions`). Botão no header de `/escola` controla open state. `sessionStorage` por `schoolId` persiste `threadId` durante a sessão da aba. Prompts sugeridos e subtitle do header derivam dos filtros ativos.

**Tech Stack:** AdonisJS 7, Lucid ORM (PostgreSQL), VineJS validators, Japa test runner / Inertia 2 / React 19 / TanStack Query / Vercel AI SDK v6 / Tailwind v4 / base-ui Dialog (Sheet primitive).

**Constraints do usuário (NÃO violar):**

- Sem tipos loose (`as`, `unknown`, `any`, `never`) — usar generics e type guards.
- Sem `Co-Authored-By` trailer nos commits.
- Tuyau inline (`api.api.v1.X.queryOptions(...)`), sem wrapper layer.
- Versões de dependência pinadas exatas — esse plano não adiciona nenhuma dependência nova (tudo já existe).

**Spec:** `docs/superpowers/specs/2026-05-16-ask-anua-escola-design.md`

---

## File Structure (resumo)

**Novos:**

- `database/migrations/1788000000010_add_surface_to_ai_threads.ts`
- `inertia/lib/contextual-prompts.ts`
- `inertia/containers/ai/ask-anua-sheet.tsx`
- `tests/functional/ai/sheet_surface.spec.ts`
- `tests/functional/ai/persona_screen_context.spec.ts`
- `tests/functional/escola/contextual_prompts.spec.ts`

**Modificados:**

- `app/models/ai_thread.ts`
- `app/ai/chat_scope.ts`
- `app/ai/personas.ts`
- `app/ai/ai_service.ts`
- `app/controllers/ai/chat_controller.ts`
- `app/controllers/ai/list_threads_controller.ts`
- `app/validators/ai.ts`
- `inertia/components/ai/ai-chat-pane.tsx`
- `inertia/components/ai/ai-chat-empty.tsx`
- `inertia/pages/escola/index.tsx`

---

## Task 1: Migration `add_surface_to_ai_threads`

**Files:**

- Create: `database/migrations/1788000000010_add_surface_to_ai_threads.ts`

- [ ] **Step 1: Escrever a migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('ai_threads', (table) => {
      table.string('surface').notNullable().defaultTo('page')
    })
  }

  async down() {
    this.schema.alterTable('ai_threads', (table) => {
      table.dropColumn('surface')
    })
  }
}
```

- [ ] **Step 2: Rodar a migration**

Run: `node ace migration:run`
Expected: log `migrated database/migrations/1788000000010_add_surface_to_ai_threads`. Tabela `ai_threads` agora tem coluna `surface text NOT NULL DEFAULT 'page'`. Threads existentes recebem `'page'` via default.

- [ ] **Step 3: Verificar coluna no schema (smoke)**

Run: `node ace make:command tmp_check_surface --noop` — não, é overkill. Em vez disso:
Run: `psql $DATABASE_URL -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='ai_threads' AND column_name='surface';"`
Expected: 1 row com `surface | text | 'page'::text`. (Se psql não estiver disponível direto, pular este step — migration logada como sucesso é suficiente.)

- [ ] **Step 4: Commit**

```bash
git add database/migrations/1788000000010_add_surface_to_ai_threads.ts
git commit -m "feat(ai): adiciona coluna surface em ai_threads (page|sheet)"
```

---

## Task 2: Adicionar atributo `surface` no model AiThread

**Files:**

- Modify: `app/models/ai_thread.ts`

- [ ] **Step 1: Adicionar a coluna no model**

Adicionar logo após o bloco do `channel` (linha 37-38 atual):

```typescript
  @column({ columnName: 'surface' })
  declare surface: 'page' | 'sheet'
```

> Nota: PrismaNamingStrategy + comentário em ai_thread.ts já explicam por que toda coluna camelCase precisa de `columnName` explícito. Mantém o padrão.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: passa sem novos erros relacionados ao model.

- [ ] **Step 3: Commit**

```bash
git add app/models/ai_thread.ts
git commit -m "feat(ai): adiciona atributo surface no model AiThread"
```

---

## Task 3: Estender `ChatScope` com campo opcional `screen`

**Files:**

- Modify: `app/ai/chat_scope.ts:19-31`

- [ ] **Step 1: Adicionar `screen?` ao tipo**

No tipo `ChatScope`, adicionar antes do fechamento `}`:

```typescript
export type ChatScope = {
  role: ChatPersonaRole
  schoolId: string
  classIds: string[]
  subjectIds: string[]
  studentIds: string[]
  studentIdsPedagogical: string[]
  studentIdsFinancial: string[]
  // Hint contextual sobre a tela onde o usuário está. NÃO é usado para
  // autorização — é só passado ao system prompt do persona pra que o
  // assistente saiba "o usuário está olhando essa visão" e use os ids
  // como filtros implícitos quando ele se referir a "essa turma" / "esse
  // período". As tools continuam validando contra classIds/studentIds do
  // próprio scope (fonte de verdade).
  screen?: {
    id: string
    filters?: Record<string, string>
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: passa. `computeChatScope` não retorna `screen` (campo opcional, fica `undefined`) — todos call sites existentes continuam válidos.

- [ ] **Step 3: Commit**

```bash
git add app/ai/chat_scope.ts
git commit -m "feat(ai): adiciona campo opcional screen em ChatScope"
```

---

## Task 4: Estender `chatValidator` para aceitar `surface` e `screen`

**Files:**

- Modify: `app/validators/ai.ts:7-15`

- [ ] **Step 1: Estender o validator**

Substituir o `chatValidator` atual:

```typescript
export const chatValidator = vine.compile(
  vine.object({
    threadId: vine.string().uuid(),
    persona: vine
      .string()
      .in(['gestor', 'comunicador', 'coordenador', 'professor', 'responsavel'])
      .optional(),
    surface: vine.string().in(['page', 'sheet']).optional(),
    screen: vine
      .object({
        id: vine.string().minLength(1).maxLength(100),
        filters: vine.record(vine.string()).optional(),
      })
      .optional(),
  })
)
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add app/validators/ai.ts
git commit -m "feat(ai): chatValidator aceita surface e screen no body"
```

---

## Task 5: `AiService.chat()` aceita `surface` e propaga ao criar thread

**Files:**

- Modify: `app/ai/ai_service.ts:30-38` (ChatRequest type)
- Modify: `app/ai/ai_service.ts:167-180` (loadOrCreateThread)

> **Por que sem unit test isolado**: `AiService.chat()` chama `streamText()` → `getModel()` → provider OpenAI que bate em endpoint real (verificado em `app/ai/ai_provider.ts`). Sem mock de provider configurado no Japa test env, qualquer unit test vazaria HTTP. A behavior é coberta no E2E HTTP do Task 7 e no manual E2E do Task 13. Mantemos Task 5 como mudança puramente estrutural: ChatRequest type + propagação. Typecheck garante a integridade.

- [ ] **Step 1: Adicionar `surface` ao `ChatRequest`**

Em `app/ai/ai_service.ts`, atualizar o tipo `ChatRequest`:

```typescript
export type ChatRequest = {
  threadId: string
  personaId: string
  schoolId: string
  userId: string
  userMessage: UIMessage
  scope: ChatScope
  abortSignal?: AbortSignal
  // Origem da thread: 'page' (chat fullscreen /escola/ia) ou 'sheet'
  // (assistente contextual aberto a partir de outras telas). Default
  // 'page' mantém comportamento histórico.
  surface?: 'page' | 'sheet'
}
```

- [ ] **Step 2: Propagar em `loadOrCreateThread`**

Substituir o `loadOrCreateThread`:

```typescript
  private async loadOrCreateThread(req: ChatRequest) {
    const existing = await AiThread.query()
      .where('id', req.threadId)
      .where('userId', req.userId)
      .first()
    if (existing) return existing

    return AiThread.create({
      id: req.threadId,
      schoolId: req.schoolId,
      userId: req.userId,
      persona: req.personaId,
      surface: req.surface ?? 'page',
    })
  }
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: passa. Todos os call sites de `aiService.chat({...})` continuam válidos porque `surface` é opcional.

- [ ] **Step 4: Commit**

```bash
git add app/ai/ai_service.ts
git commit -m "feat(ai): AiService.chat aceita surface e propaga ao criar thread"
```

---

## Task 6: Gestor persona anexa contexto de tela ao system prompt

**Files:**

- Modify: `app/ai/personas.ts:36-56` (gestorPrompt)
- Test: `tests/functional/ai/persona_screen_context.spec.ts`

- [ ] **Step 1: Escrever o test failing**

Criar `tests/functional/ai/persona_screen_context.spec.ts`:

```typescript
import { test } from '@japa/runner'
import { personas } from '#ai/personas'
import type { SystemPromptContext } from '#ai/personas'
import type { ChatScope } from '#ai/chat_scope'

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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node ace test --files="tests/functional/ai/persona_screen_context.spec.ts"`
Expected: FAIL — prompt atual não menciona "Tela atual" / "dashboard" / etc.

- [ ] **Step 3: Adicionar helper + bloco no gestor prompt**

Em `app/ai/personas.ts`, adicionar antes da função `gestorPrompt`:

```typescript
const SCREEN_LABELS: Record<string, string> = {
  escola_dashboard: 'dashboard da escola',
}

const FILTER_LABELS: Record<string, string> = {
  academicPeriodId: 'período letivo',
  subPeriodId: 'etapa/sub-período',
  courseId: 'curso',
  levelId: 'nível',
  classId: 'turma',
}

function renderScreenContext(screen: NonNullable<ChatScope['screen']>): string {
  const screenLabel = SCREEN_LABELS[screen.id] ?? screen.id
  const filterEntries = Object.entries(screen.filters ?? {}).filter(
    ([, value]) => typeof value === 'string' && value.length > 0
  )

  if (filterEntries.length === 0) {
    return [
      '',
      'Tela atual: o usuário está olhando o ' + screenLabel + ' sem filtros aplicados.',
      'Quando ele perguntar "a escola" ou usar termos genéricos, assuma o escopo de toda a escola.',
    ].join('\n')
  }

  const filterLines = filterEntries
    .map(([key, value]) => `${FILTER_LABELS[key] ?? key}=${value}`)
    .join(', ')

  return [
    '',
    `Tela atual: o usuário está olhando o ${screenLabel} com os seguintes filtros aplicados agora: ${filterLines}.`,
    'Use esses filtros como contexto implícito — quando ele perguntar "a turma", "esse período", "esse curso", etc., assuma os valores acima.',
    'Ao chamar tools que aceitam esses parâmetros, passe os ids correspondentes salvo se ele pedir explicitamente outra coisa.',
  ].join('\n')
}
```

Importar `ChatScope` no topo se ainda não estiver (provavelmente já está via `SystemPromptContext`).

Modificar `gestorPrompt` pra anexar o bloco quando `ctx.scope.screen` presente:

```typescript
function gestorPrompt(ctx: SystemPromptContext): string {
  const screenBlock = ctx.scope.screen ? renderScreenContext(ctx.scope.screen) : ''
  return `Você é um assistente de gestão escolar trabalhando na escola "${ctx.school.name}" (id: ${ctx.school.id}).
Usuário atual: ${ctx.user.name} (id: ${ctx.user.id}). Data atual: ${ctx.currentDate}.
Sua função é analisar dados da escola, gerar insights acionáveis e sugerir ações concretas para o gestor.

${SHARED_RULES}

Tools disponíveis pra essa persona:
- getSchoolStats: estatísticas gerais (total de alunos, inadimplência) da escola atual.
- getStudentAlerts: alertas de alunos com pagamentos vencidos ou problemas críticos.
- getHistoricalComparison: compara um indicador (boletos vencidos, alunos matriculados, faltas, comunicados publicados) entre hoje e período passado (7d/30d/90d/12m). Use quando o usuário pedir tendência, "subiu/desceu", "vs mês passado", etc.
- getSchema: descobre tabelas e colunas disponíveis. Use ANTES de queryDatabase.
- queryDatabase: roda SELECT no banco da escola. SEMPRE escope por "schoolId" = schoolId.
- renderResult: renderiza dados como componente visual. Componentes: SchoolStatsCard, StudentAlertsCard, DataTable, Stat, Chart, InfoCard, Comparison.

Estratégia recomendada:
- Pergunta simples sobre stats? → use getSchoolStats / getStudentAlerts.
- Pergunta envolvendo outras tabelas (turmas, professores, pagamentos)? → getSchema → queryDatabase → renderResult.
- Resposta final: sempre que tiver dados estruturados, chame renderResult com o componente certo.${screenBlock}
`
}
```

- [ ] **Step 4: Rodar o test pra confirmar passa**

Run: `node ace test --files="tests/functional/ai/persona_screen_context.spec.ts"`
Expected: PASS — todos os 4 tests passam.

- [ ] **Step 5: Garantir que persona spec existente não quebrou**

Run: `node ace test --files="tests/functional/ai/personas.spec.ts"`
Expected: PASS — sem regressão.

- [ ] **Step 6: Commit**

```bash
git add app/ai/personas.ts tests/functional/ai/persona_screen_context.spec.ts
git commit -m "feat(ai): persona gestor anexa contexto de tela ao system prompt"
```

---

## Task 7: `chat_controller` lê `surface` e `screen` do body e injeta no scope/service

**Files:**

- Modify: `app/controllers/ai/chat_controller.ts:18` (extrair do validator)
- Modify: `app/controllers/ai/chat_controller.ts:53-75` (passar pro service)
- Test: estender `tests/functional/ai/sheet_surface.spec.ts` com test E2E do endpoint (opcional — depende de existir test infra pra POST /api/v1/ai/chat).

- [ ] **Step 1: Verificar se já existe spec de E2E pro endpoint `/api/v1/ai/chat`**

Run: `grep -r "api/v1/ai/chat" tests/ --include="*.ts" -l`
Expected: lista de specs (ou vazio). Se vazio: pular E2E test do controller — Task 5/6 já cobrem o caminho via AiService unit test. Marcar Step 2 como skipped e ir direto pro Step 4. Se houver: adicionar test que valida `body.surface='sheet'` cria thread com surface='sheet' (espelha o que já testamos no AiService, mas validando o caminho HTTP).

- [ ] **Step 2: (Condicional) Adicionar test E2E do controller**

Se Step 1 encontrou specs E2E (ex: `tests/functional/ai/chat_endpoint.spec.ts`), adicionar test:

```typescript
test('POST /api/v1/ai/chat com body.surface=sheet cria thread sheet', async ({
  client,
  assert,
}) => {
  // ...setup do user (gestor) e auth no estilo do spec existente
  const threadId = uuidv7()
  const response = await client
    .post('/api/v1/ai/chat')
    .json({
      threadId,
      surface: 'sheet',
      screen: { id: 'escola_dashboard', filters: { classId: 'cls-1' } },
      messages: [{ id: uuidv7(), role: 'user', parts: [{ type: 'text', text: 'oi' }] }],
    })
    .loginAs(gestorUser)
  response.assertStatus(200)
  const thread = await AiThread.find(threadId)
  assert.equal(thread!.surface, 'sheet')
})
```

Se não existir infra pra isso, pular.

- [ ] **Step 3: (Condicional) Rodar test pra ver falhar**

Run: `node ace test --files="tests/functional/ai/<o-spec-encontrado>"`
Expected: FAIL — controller ainda não lê surface.

- [ ] **Step 4: Modificar `chat_controller.ts` pra extrair e passar**

Em `app/controllers/ai/chat_controller.ts`, substituir a linha 18:

```typescript
const {
  threadId,
  persona: requestedPersona,
  surface,
  screen,
} = await request.validateUsing(chatValidator)
```

E na chamada do `aiService.chat()` (linha ~67), incluir surface e screen-into-scope:

```typescript
const scopeWithScreen: ChatScope = screen ? { ...scope, screen } : scope

const aiService = new AiService()
const { result } = await aiService.chat({
  threadId,
  personaId,
  schoolId,
  userId: user.id,
  userMessage: lastUserMessage,
  scope: scopeWithScreen,
  surface,
  abortSignal: abortController.signal,
})
```

Adicionar import no topo do arquivo (se ainda não houver):

```typescript
import type { ChatScope } from '#ai/chat_scope'
```

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: passa.

- [ ] **Step 6: (Condicional) Rodar test E2E pra confirmar passa**

Se Step 2 foi feito:
Run: `node ace test --files="tests/functional/ai/<o-spec>"`
Expected: PASS.

- [ ] **Step 7: Smoke geral**

Run: `node ace test --files="tests/functional/ai/**/*.spec.ts"`
Expected: todos passam.

- [ ] **Step 8: Commit**

```bash
git add app/controllers/ai/chat_controller.ts
# Adicionar separadamente o spec do Step 2 se ele foi criado:
#   git add tests/functional/ai/chat_endpoint.spec.ts
git commit -m "feat(ai): chat_controller propaga surface e screen ao AiService"
```

---

## Task 8: `list_threads_controller` filtra `surface='page'` por padrão

**Files:**

- Modify: `app/controllers/ai/list_threads_controller.ts:8-13`

- [ ] **Step 1: Escrever test failing**

Criar `tests/functional/ai/list_threads_filter_surface.spec.ts`:

```typescript
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { v7 as uuidv7 } from 'uuid'
import AiThread from '#models/ai_thread'

async function startTx() {
  await db.beginGlobalTransaction()
  return async () => {
    await db.rollbackGlobalTransaction()
  }
}

test.group('GET /api/v1/ai/threads filtra surface=page', (group) => {
  group.each.setup(startTx)

  test('default exclui threads surface=sheet', async ({ client, assert }) => {
    // Seguir o padrão de criação de gestor user dos outros specs (ex:
    // chat_role.spec.ts). Inline aqui é pseudocode — adaptar à fixture real.
    const gestor = await createGestorUserFixture()

    const pageThreadId = uuidv7()
    const sheetThreadId = uuidv7()
    await AiThread.createMany([
      { id: pageThreadId, userId: gestor.id, schoolId: gestor.schoolId, surface: 'page' },
      { id: sheetThreadId, userId: gestor.id, schoolId: gestor.schoolId, surface: 'sheet' },
    ])

    const response = await client.get('/api/v1/ai/threads').loginAs(gestor)
    response.assertStatus(200)
    const ids = response.body().map((t: { id: string }) => t.id)
    assert.include(ids, pageThreadId)
    assert.notInclude(ids, sheetThreadId)
  })
})
```

> Nota: `createGestorUserFixture` é placeholder — adaptar ao helper real (ver `tests/helpers/` ou `tests/functional/auth/`). Se a infra não existir pra fazer client.get com auth nesse projeto, fallback: chamar o controller direto via dispatching ou substituir test por chamada direta ao `ListThreadsController.handle` com HttpContext mockado. Mas o padrão do repo já tem suporte a `client.loginAs` — usar.

- [ ] **Step 2: Rodar test pra ver falhar**

Run: `node ace test --files="tests/functional/ai/list_threads_filter_surface.spec.ts"`
Expected: FAIL — ambos os threads (page + sheet) retornados.

- [ ] **Step 3: Modificar `list_threads_controller.ts`**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'

export default class ListThreadsController {
  async handle({ response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!

    const threads = await AiThread.query()
      .where('userId', user.id)
      .where('surface', 'page')
      .preload('messages', (query) => {
        query.orderBy('createdAt', 'desc').limit(1)
      })
      .orderBy('updatedAt', 'desc')

    const data = threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      persona: thread.persona,
      lastMessage: thread.messages[0]?.content ?? null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }))

    return response.ok(data)
  }
}
```

- [ ] **Step 4: Rodar test pra confirmar passa**

Run: `node ace test --files="tests/functional/ai/list_threads_filter_surface.spec.ts"`
Expected: PASS.

- [ ] **Step 5: Buscar outros call sites de AiThread que listam threads (verificar regressão)**

Run: `grep -rn "AiThread.query()" app/ --include="*.ts"`
Expected: rever cada resultado e confirmar que:

- Queries que buscam thread por ID (`.where('id', threadId)`) NÃO precisam de filtro de surface (id é único).
- Queries que listam threads pra um user devem decidir caso-a-caso. Se houver outras listas de threads no app que devem ignorar sheet threads, aplicar mesmo filtro. Para V1, só `list_threads_controller` faz isso.
- Listar resultados encontrados como comentário no commit pra rastreabilidade.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/ai/list_threads_controller.ts tests/functional/ai/list_threads_filter_surface.spec.ts
git commit -m "feat(ai): list_threads_controller filtra surface=page por padrão"
```

---

## Task 9: Utility `contextual-prompts.ts` (frontend)

**Files:**

- Create: `inertia/lib/contextual-prompts.ts`
- Test: `tests/functional/escola/contextual_prompts.spec.ts`

- [ ] **Step 1: Criar diretório de teste se necessário e escrever test failing**

Run: `mkdir -p tests/functional/escola`

Criar `tests/functional/escola/contextual_prompts.spec.ts`:

```typescript
import { test } from '@japa/runner'
import {
  buildContextualPrompts,
  formatContextLabel,
  type TabFilterState,
  type FilterLabels,
} from '../../../inertia/lib/contextual-prompts.js'

const labels: FilterLabels = {
  academicPeriodName: '2026',
  courseName: 'Fundamental I',
  levelName: '1º ano',
  className: '1º ano A',
}

const noFilters: TabFilterState = {
  academicPeriodId: 'all',
  subPeriodId: 'all',
  courseId: 'all',
  levelId: 'all',
  classId: 'all',
}

test.group('contextual-prompts', () => {
  test('sem filtros → 4 prompts gerais', ({ assert }) => {
    const prompts = buildContextualPrompts(noFilters, labels)
    assert.equal(prompts.length, 4)
    assert.isTrue(prompts.every((p) => typeof p === 'string' && p.length > 0))
  })

  test('só período → prompts mencionam o período', ({ assert }) => {
    const filters: TabFilterState = { ...noFilters, academicPeriodId: 'ap-1' }
    const prompts = buildContextualPrompts(filters, labels)
    assert.isTrue(prompts.some((p) => p.includes('2026')))
  })

  test('até turma → prompts mencionam a turma', ({ assert }) => {
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      levelId: 'l-1',
      classId: 'cl-1',
    }
    const prompts = buildContextualPrompts(filters, labels)
    assert.isTrue(prompts.some((p) => p.includes('1º ano A')))
  })

  test('formatContextLabel sem filtros → "Visão geral da escola"', ({ assert }) => {
    assert.equal(formatContextLabel(noFilters, labels), 'Visão geral da escola')
  })

  test('formatContextLabel com período → "2026"', ({ assert }) => {
    const filters: TabFilterState = { ...noFilters, academicPeriodId: 'ap-1' }
    assert.equal(formatContextLabel(filters, labels), '2026')
  })

  test('formatContextLabel com período+curso+turma → "2026 · Fundamental I · 1º ano A"', ({
    assert,
  }) => {
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      classId: 'cl-1',
    }
    assert.equal(formatContextLabel(filters, labels), '2026 · Fundamental I · 1º ano A')
  })

  test('formatContextLabel trunca em 50 chars', ({ assert }) => {
    const longLabels: FilterLabels = {
      academicPeriodName: 'Período letivo de 2026 (ano civil completo)',
      courseName: 'Curso Fundamental Anos Iniciais Integral Manhã',
      levelName: '1º ano do Ensino Fundamental',
      className: 'Turma A do 1º ano',
    }
    const filters: TabFilterState = {
      ...noFilters,
      academicPeriodId: 'ap-1',
      courseId: 'c-1',
      classId: 'cl-1',
    }
    const label = formatContextLabel(filters, longLabels)
    assert.isAtMost(label.length, 50)
    assert.isTrue(label.endsWith('…'))
  })
})
```

- [ ] **Step 2: Rodar test pra ver falhar**

Run: `node ace test --files="tests/functional/escola/contextual_prompts.spec.ts"`
Expected: FAIL — arquivo `inertia/lib/contextual-prompts.ts` ainda não existe.

- [ ] **Step 3: Implementar `contextual-prompts.ts`**

Criar `inertia/lib/contextual-prompts.ts`:

```typescript
// Tipos espelham o estado de filtros em /escola/index.tsx. Mantém em sync
// se aparecer um filtro novo lá.
export type TabFilterState = {
  academicPeriodId: string
  subPeriodId: string
  courseId: string
  levelId: string
  classId: string
}

export type FilterLabels = {
  academicPeriodName?: string
  courseName?: string
  levelName?: string
  className?: string
}

const MAX_LABEL_LENGTH = 50

function isSet(value: string): boolean {
  return value !== 'all' && value.length > 0
}

export function formatContextLabel(filters: TabFilterState, labels: FilterLabels): string {
  if (!isSet(filters.academicPeriodId)) return 'Visão geral da escola'

  const parts: string[] = []
  if (labels.academicPeriodName) parts.push(labels.academicPeriodName)
  if (isSet(filters.courseId) && labels.courseName) parts.push(labels.courseName)
  if (isSet(filters.levelId) && !isSet(filters.classId) && labels.levelName) {
    parts.push(labels.levelName)
  }
  if (isSet(filters.classId) && labels.className) parts.push(labels.className)

  const label = parts.join(' · ')
  if (label.length <= MAX_LABEL_LENGTH) return label
  return label.slice(0, MAX_LABEL_LENGTH - 1) + '…'
}

const GENERAL_PROMPTS = [
  'Quais turmas têm mais alunos em risco esse ano?',
  'Mostra a frequência média por curso no último mês',
  'Quais professores têm mais notas pendentes pra lançar?',
  'Resumo da inadimplência atual',
]

function periodPrompts(periodName: string): string[] {
  return [
    `Como está o desempenho geral em ${periodName}?`,
    `Quais alunos estão em risco no ${periodName}?`,
    `Compara a frequência entre cursos no ${periodName}`,
    `Resumo da inadimplência no ${periodName}`,
  ]
}

function classPrompts(className: string): string[] {
  return [
    `Como está a frequência da turma ${className}?`,
    `Quais alunos da turma ${className} estão em risco?`,
    `Distribuição de notas em ${className}`,
    `Lança presença da turma ${className} hoje`,
  ]
}

export function buildContextualPrompts(filters: TabFilterState, labels: FilterLabels): string[] {
  if (isSet(filters.classId) && labels.className) {
    return classPrompts(labels.className)
  }
  if (isSet(filters.academicPeriodId) && labels.academicPeriodName) {
    return periodPrompts(labels.academicPeriodName)
  }
  return GENERAL_PROMPTS
}
```

- [ ] **Step 4: Rodar test pra confirmar passa**

Run: `node ace test --files="tests/functional/escola/contextual_prompts.spec.ts"`
Expected: PASS — todos os tests passam.

- [ ] **Step 5: Commit**

```bash
git add inertia/lib/contextual-prompts.ts tests/functional/escola/contextual_prompts.spec.ts
git commit -m "feat(escola): utility de prompts e label contextualizados por filtro"
```

---

## Task 10: Estender `AiChatPane` e `AiChatEmpty` com novas props

**Files:**

- Modify: `inertia/components/ai/ai-chat-empty.tsx:121-164`
- Modify: `inertia/components/ai/ai-chat-pane.tsx:140-376`

- [ ] **Step 1: Adicionar prop `suggestions` em `AiChatEmpty`**

Em `inertia/components/ai/ai-chat-empty.tsx`, modificar o `AiChatEmptyProps` e a função:

```typescript
type AiChatEmptyProps = {
  onPick: (prompt: string) => void
  userName?: string
  persona?: ChatPersonaRole
  // Quando presente, substitui os SUGGESTIONS_BY_PERSONA defaults pra
  // refletir contexto da tela (ex: filtros ativos no dashboard). Cada
  // string vira um botão com o ícone Sparkles padrão.
  suggestions?: string[]
}

export function AiChatEmpty({
  onPick,
  userName,
  persona = 'gestor',
  suggestions,
}: AiChatEmptyProps) {
  const subtitle = SUBTITLE_BY_PERSONA[persona]
  const items: Suggestion[] = suggestions
    ? suggestions.map((prompt) => ({
        icon: Sparkles,
        label: prompt.length > 32 ? prompt.slice(0, 31) + '…' : prompt,
        prompt,
      }))
    : SUGGESTIONS_BY_PERSONA[persona]
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {userName ? `Olá, ${userName.split(' ')[0]}` : 'Como posso ajudar?'}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label + prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className={cn(
              'group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left',
              'transition-all duration-150 hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="block truncate text-xs text-muted-foreground mt-0.5">
                {prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Adicionar props `hideHeader`, `screen`, `surface`, `suggestions` em `AiChatPane`**

Em `inertia/components/ai/ai-chat-pane.tsx`:

Atualizar `AiChatPaneProps`:

```typescript
type AiChatPaneProps = {
  threadId: string
  persona?: ChatPersonaRole
  isNewThread: boolean
  userName?: string
  onPersisted?: (threadId: string) => void
  // Quando true, não renderiza o ChatHeader interno — usado quando o
  // container parent (ex: Sheet) provê seu próprio header.
  hideHeader?: boolean
  // Hint contextual sobre a tela atual; propagado no body de cada
  // sendMessage. Backend repassa pro system prompt do persona.
  screen?: { id: string; filters?: Record<string, string> }
  // Origem da thread. 'sheet' marca threads do assistente contextual pra
  // ficarem fora da listagem do /escola/ia. Default 'page'.
  surface?: 'page' | 'sheet'
  // Sobrescreve os prompts sugeridos do empty state.
  suggestions?: string[]
}
```

Propagar pra `ActiveChat`:

```typescript
export function AiChatPane({
  threadId,
  persona = 'gestor',
  isNewThread,
  userName,
  onPersisted,
  hideHeader = false,
  screen,
  surface,
  suggestions,
}: AiChatPaneProps) {
  // ... existing loading / hasRenderedRef logic, but pass new props down:
  return (
    <ActiveChat
      threadId={threadId}
      persona={persona}
      initialMessages={initialMessages}
      headerTitle={headerTitle}
      userName={userName}
      resume={!isNewThread}
      isNewThread={isNewThread}
      onPersisted={onPersisted}
      hideHeader={hideHeader}
      screen={screen}
      surface={surface}
      suggestions={suggestions}
    />
  )
}
```

> Cuidado: o loader inicial (linha ~169-178) renderiza um `ChatHeader` interno enquanto a query carrega. Quando `hideHeader=true`, NÃO renderizar esse header tampouco:

```typescript
  if (!isNewThread && isLoading && !hasRenderedRef.current) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        {!hideHeader && <ChatHeader title={null} />}
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
```

Atualizar `ActiveChatProps`:

```typescript
type ActiveChatProps = {
  threadId: string
  persona: ChatPersonaRole
  initialMessages: UIMessage[]
  headerTitle: string
  userName?: string
  resume: boolean
  isNewThread: boolean
  onPersisted?: (threadId: string) => void
  hideHeader: boolean
  screen?: { id: string; filters?: Record<string, string> }
  surface?: 'page' | 'sheet'
  suggestions?: string[]
}
```

Modificar o `transport` pra incluir `screen` e `surface` no body:

```typescript
const transport = useMemo(
  () =>
    new DefaultChatTransport({
      api: '/api/v1/ai/chat',
      body: { threadId, persona, screen, surface },
      credentials: 'include',
      prepareReconnectToStreamRequest: ({ id }) => ({
        api: `/api/v1/ai/chat/${id}/stream`,
        credentials: 'include',
      }),
    }),
  [threadId, persona, screen, surface]
)
```

> Nota crítica: `screen` é objeto — quando o objeto muda de identidade entre renders, o `useMemo` recria o transport, o que reinicia o `useChat` SSE. Pra evitar oscilação, o container parent (`AskAnuaSheet`) precisa estabilizar o `screen` via `useMemo` antes de passar pra cá (cobrir isso no Task 11).

Modificar o JSX da `ActiveChat` pra esconder header e usar suggestions:

```typescript
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {!hideHeader && <ChatHeader title={headerTitle} />}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {showEmpty ? (
          <AiChatEmpty
            onPick={async (prompt) => {
              await submit(prompt)
            }}
            userName={userName}
            persona={persona}
            suggestions={suggestions}
          />
        ) : (
          // ... resto inalterado
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: passa.

- [ ] **Step 4: Smoke do `/escola/ia` existente**

Run dev server: `pnpm dev` (em background ou outro terminal)
Abrir `/escola/ia` no browser, mandar uma mensagem. Confirmar que continua funcionando (props novas são opcionais, comportamento existente preservado).

- [ ] **Step 5: Commit**

```bash
git add inertia/components/ai/ai-chat-empty.tsx inertia/components/ai/ai-chat-pane.tsx
git commit -m "feat(ai): AiChatPane aceita hideHeader, screen, surface e suggestions"
```

---

## Task 11: Container `AskAnuaSheet`

**Files:**

- Create: `inertia/containers/ai/ask-anua-sheet.tsx`

**Modelo do estado:**

- `threadId` vive no `sessionStorage` por `schoolId`. Reload da MESMA aba mantém; aba nova / fechar perde.
- `isFresh` (flag separada em sessionStorage): controla se `AiChatPane` deve carregar histórico do server. `true` = empty state. Vira `false` quando a primeira mensagem é persistida (callback `onPersisted` do `AiChatPane`).
- Reload da aba com thread persistida: `threadId` mantido, `isFresh=false` → `AiChatPane` faz `useQuery` pra carregar mensagens via API.
- "+ nova conversa": gera novo UUID, marca `isFresh=true`, força remount do `AiChatPane` via `key={threadId}`.
- `schoolId` muda (multi-school user): regenera threadId pro novo schoolId — não vaza thread entre escolas.

- [ ] **Step 1: Criar o container completo**

Criar `inertia/containers/ai/ask-anua-sheet.tsx`:

```typescript
import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { AiChatPane } from '~/components/ai/ai-chat-pane'
import { useAuthUser } from '~/stores/auth_store'
import { useIsMobile } from '~/hooks/use_mobile'
import {
  buildContextualPrompts,
  formatContextLabel,
  type FilterLabels,
  type TabFilterState,
} from '~/lib/contextual-prompts'

type AskAnuaSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: TabFilterState
  labels: FilterLabels
}

function threadKey(schoolId: string): string {
  return `anua:ask-sheet:thread:${schoolId}`
}

function freshKey(schoolId: string): string {
  return `anua:ask-sheet:fresh:${schoolId}`
}

function readOrCreateThreadId(schoolId: string): { id: string; fresh: boolean } {
  if (typeof window === 'undefined' || !schoolId) {
    return { id: crypto.randomUUID(), fresh: true }
  }
  const stored = window.sessionStorage.getItem(threadKey(schoolId))
  if (stored) {
    const fresh = window.sessionStorage.getItem(freshKey(schoolId)) !== 'false'
    return { id: stored, fresh }
  }
  const id = crypto.randomUUID()
  window.sessionStorage.setItem(threadKey(schoolId), id)
  window.sessionStorage.setItem(freshKey(schoolId), 'true')
  return { id, fresh: true }
}

export function AskAnuaSheet({ open, onOpenChange, filters, labels }: AskAnuaSheetProps) {
  const user = useAuthUser()
  const isMobile = useIsMobile()
  const schoolId = user?.school?.id ?? ''

  const initial = readOrCreateThreadId(schoolId)
  const [threadId, setThreadId] = useState<string>(initial.id)
  const [isFresh, setIsFresh] = useState<boolean>(initial.fresh)

  // Trocar de escola regenera escopo — threadId antigo seguia preso ao
  // schoolId errado e o backend rejeitaria querying na escola nova.
  useEffect(() => {
    if (!schoolId) return
    const refreshed = readOrCreateThreadId(schoolId)
    setThreadId(refreshed.id)
    setIsFresh(refreshed.fresh)
  }, [schoolId])

  function handleNewConversation() {
    if (typeof window === 'undefined' || !schoolId) return
    const id = crypto.randomUUID()
    window.sessionStorage.setItem(threadKey(schoolId), id)
    window.sessionStorage.setItem(freshKey(schoolId), 'true')
    setThreadId(id)
    setIsFresh(true)
  }

  function handlePersisted() {
    if (typeof window === 'undefined' || !schoolId) return
    window.sessionStorage.setItem(freshKey(schoolId), 'false')
    setIsFresh(false)
  }

  const screen = useMemo(() => {
    const activeFilters: Record<string, string> = {}
    if (filters.academicPeriodId !== 'all') {
      activeFilters.academicPeriodId = filters.academicPeriodId
    }
    if (filters.subPeriodId !== 'all') activeFilters.subPeriodId = filters.subPeriodId
    if (filters.courseId !== 'all') activeFilters.courseId = filters.courseId
    if (filters.levelId !== 'all') activeFilters.levelId = filters.levelId
    if (filters.classId !== 'all') activeFilters.classId = filters.classId
    return {
      id: 'escola_dashboard',
      filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
    }
  }, [
    filters.academicPeriodId,
    filters.subPeriodId,
    filters.courseId,
    filters.levelId,
    filters.classId,
  ])

  const suggestions = useMemo(
    () => buildContextualPrompts(filters, labels),
    [filters, labels]
  )

  const contextLabel = formatContextLabel(filters, labels)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'h-[90vh] w-full p-0'
            : 'w-full p-0 sm:max-w-[560px]'
        }
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">
                Perguntar ao Anuá
              </h2>
              <p className="truncate text-xs text-muted-foreground">{contextLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleNewConversation}
              aria-label="Nova conversa"
              title="Nova conversa"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <AiChatPane
            key={threadId}
            threadId={threadId}
            persona="gestor"
            isNewThread={isFresh}
            hideHeader
            screen={screen}
            surface="sheet"
            suggestions={suggestions}
            userName={user?.name ?? undefined}
            onPersisted={handlePersisted}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

> Notas:
>
> - `useAuthUser` é o store de auth — confirmar caminho de import (`~/stores/auth_store`) seguindo o uso já existente em `inertia/pages/escola/index.tsx:46`.
> - `useIsMobile` em `inertia/hooks/use_mobile.ts` — confirmar o nome do export (`useIsMobile` ou `useMobile`); ajustar o import se diferente.
> - `crypto.randomUUID()` é nativo do browser em todos os contextos modernos; sem polyfill necessário.
> - `key={threadId}` força remount do `AiChatPane` quando novo thread é criado — garante que o `useChat` reinicia limpinho.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add inertia/containers/ai/ask-anua-sheet.tsx
git commit -m "feat(escola): adiciona container AskAnuaSheet (assistente contextual)"
```

---

## Task 12: Botão + integração no `/escola/index.tsx`

**Files:**

- Modify: `inertia/pages/escola/index.tsx`

- [ ] **Step 1: Importar componentes e helpers**

No topo de `/escola/index.tsx`, adicionar:

```typescript
import { Sparkles } from 'lucide-react'
import { AskAnuaSheet } from '../../containers/ai/ask-anua-sheet'
import type { FilterLabels } from '../../lib/contextual-prompts'
```

(o ícone `Sparkles` provavelmente já não está importado — verificar a lista de ícones lucide-react no topo do arquivo).

- [ ] **Step 2: Adicionar state do Sheet no componente**

Logo após os useState existentes (`activeTab`, `filters`, etc.):

```typescript
const [isAskAnuaOpen, setIsAskAnuaOpen] = useState(false)
```

- [ ] **Step 3: Derivar labels pros filtros**

Logo após os memos existentes (`selectedPeriodLabel` etc.):

```typescript
const askAnuaLabels: FilterLabels = useMemo(
  () => ({
    academicPeriodName:
      filters.academicPeriodId === 'all'
        ? undefined
        : academicPeriods.find((p) => p.id === filters.academicPeriodId)?.name,
    courseName:
      filters.courseId === 'all'
        ? undefined
        : courses.find((c) => c.courseId === filters.courseId)?.name,
    levelName:
      filters.levelId === 'all' ? undefined : levels.find((l) => l.id === filters.levelId)?.name,
    className: selectedClass ? `${selectedClass.levelName} - ${selectedClass.name}` : undefined,
  }),
  [filters, academicPeriods, courses, levels, selectedClass]
)
```

- [ ] **Step 4: Adicionar botão no `viewModeToggle`**

Visibilidade do botão alinhada com `canViewFinancialTab` (lógica idêntica — admin/diretor/chain director). Encapsular num helper local:

```typescript
const canUseAskAnua = canViewFinancialTab
```

Modificar `viewModeToggle` pra incluir o botão (envolver no fragment existente):

```typescript
  const viewModeToggle = (
    <>
      {canUseAskAnua && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAskAnuaOpen(true)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Perguntar ao Anuá</span>
          <span className="sr-only sm:hidden">Perguntar ao Anuá</span>
        </Button>
      )}
      <Button
        type="button"
        variant={viewMode === 'full' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('full')}
      >
        Visão completa
      </Button>
      <Button
        type="button"
        variant={viewMode === 'simple' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('simple')}
      >
        Visão simplificada
      </Button>
    </>
  )
```

- [ ] **Step 5: Renderizar o `<AskAnuaSheet />` no return JSX**

Adicionar uma única vez no nível mais alto possível dentro do JSX retornado (tanto no branch de viewMode=simple quanto no full). Para evitar duplicação, declarar antes do return:

```typescript
  const askAnuaSheet = canUseAskAnua ? (
    <AskAnuaSheet
      open={isAskAnuaOpen}
      onOpenChange={setIsAskAnuaOpen}
      filters={filters}
      labels={askAnuaLabels}
    />
  ) : null
```

Incluir `{askAnuaSheet}` ao final de cada branch (`viewMode === 'simple'` e o branch principal). No simple mode, antes do `</EscolaLayoutSimplificado>`. No full mode, antes do `</EscolaLayout>`.

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: passa.

- [ ] **Step 7: Commit**

```bash
git add inertia/pages/escola/index.tsx
git commit -m "feat(escola): botão 'Perguntar ao Anuá' abre Sheet contextual no dashboard"
```

---

## Task 13: Manual E2E smoke + lint

**Files:**

- N/A (verificação manual)

- [ ] **Step 1: Lint geral**

Run: `pnpm lint`
Expected: passa sem warnings/errors novos. Se algum lint quebrar, ajustar inline e re-rodar.

- [ ] **Step 2: Typecheck geral**

Run: `pnpm typecheck`
Expected: passa em ambos os projects (server + inertia).

- [ ] **Step 3: Roda todos os tests do AI**

Run: `node ace test --files="tests/functional/ai/**/*.spec.ts" --files="tests/functional/escola/**/*.spec.ts"`
Expected: todos passam.

- [ ] **Step 4: Manual E2E — dashboard**

1. `pnpm dev` (se ainda não estiver rodando).
2. Logar como `SCHOOL_DIRECTOR` ou `SCHOOL_ADMIN`. Abrir `/escola`.
3. Botão "Perguntar ao Anuá" aparece no header com ícone Sparkles. Em mobile (DevTools < 640px): só ícone, sem label.
4. Click no botão → Sheet abre pela direita (desktop) ou bottom (mobile).
5. Header do Sheet: "Perguntar ao Anuá" + subtitle "Visão geral da escola" (sem filtros).
6. Empty state: prompts gerais visíveis ("Quais turmas têm mais alunos em risco...", etc.).
7. Click num prompt → mensagem enviada, AI responde.
8. Fechar Sheet (X ou click no overlay).
9. Filtrar pra uma turma específica via os Selects do dashboard.
10. Reabrir Sheet → mesma conversa visível, subtitle agora mostra "2026 · Fundamental I · 1º ano A" (ou similar conforme dados reais).
11. Mandar nova pergunta tipo "como está a frequência?" → AI deve usar o classId no contexto (verificar no terminal de logs/queries que o ID veio no system prompt — opcional, smoke é suficiente).
12. Click no botão `+` (nova conversa) → empty state volta, agora com prompts mencionando a turma atual ("Como está a frequência da turma 1º ano A?").
13. Recarregar a aba (F5) → reabrir Sheet → mesma thread mantida (sessionStorage).
14. Fechar aba inteira, abrir nova aba, abrir Sheet → thread nova.

- [ ] **Step 5: Manual E2E — isolamento de threads**

1. Como mesmo gestor logado, navegar pra `/escola/ia`.
2. A sidebar de threads NÃO deve mostrar nenhuma das conversas criadas no Sheet. Só threads históricas + threads criadas via fullscreen.
3. Se aparecer alguma thread do Sheet na sidebar: bug — voltar ao Task 8 e investigar.

- [ ] **Step 6: Manual E2E — permissão**

1. Logar como `SCHOOL_TEACHER`. Abrir `/escola` (mostra a versão pra professor).
2. Botão "Perguntar ao Anuá" NÃO deve aparecer no header.
3. Se aparecer: bug — revisar Step 4 do Task 12 (lógica de `canUseAskAnua`).

- [ ] **Step 7: Atualizar status final**

Tudo verde? Plano concluído. Se algum E2E falhar, criar issue de follow-up com o caso exato e voltar ao Task que mexe na área quebrada.

---

## Verificação retroativa contra o Spec

Cobertura por seção do spec:

| Seção do spec                                                    | Task que cobre                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Migration `add_surface_to_ai_threads`                            | Task 1                                                    |
| `AiThread.surface` no model                                      | Task 2                                                    |
| `ChatScope.screen` opcional                                      | Task 3                                                    |
| `chatValidator` aceita `screen`/`surface`                        | Task 4                                                    |
| `AiService.chat` propaga `surface`                               | Task 5                                                    |
| `AiService.chat` propaga `screen` no scope (via controller)      | Task 7 (controller injeta no scope)                       |
| Persona gestor system prompt com screen                          | Task 6                                                    |
| `chat_controller` lê body                                        | Task 7                                                    |
| `list_threads_controller` filtra `surface='page'`                | Task 8                                                    |
| `buildContextualPrompts` / `formatContextLabel`                  | Task 9                                                    |
| `AiChatPane` props `hideHeader`/`screen`/`surface`/`suggestions` | Task 10                                                   |
| `AiChatEmpty` prop `suggestions`                                 | Task 10                                                   |
| `AskAnuaSheet` container                                         | Task 11                                                   |
| Botão no header + integração na page                             | Task 12                                                   |
| Visibilidade do botão por role                                   | Task 12 (`canUseAskAnua = canViewFinancialTab`)           |
| Mobile: bottom sheet + icon-only button                          | Tasks 11 (sheet side) + 12 (button label sr-only em < sm) |
| sessionStorage por schoolId                                      | Task 11                                                   |
| Out of scope V2 itens                                            | Não implementado (correto)                                |
| Manual E2E checklist                                             | Task 13                                                   |

Sem gaps.
