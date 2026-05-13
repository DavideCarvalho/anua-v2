# IA no Anuá — Sprint 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Setup Redis, AI SDK, CroF provider, AiService, chat streaming SSE, tools, e frontend de chat

**Architecture:** Serviço de IA com provider CroF (OpenAI-compatível), Vercel AI SDK, streaming SSE, registro de tools por persona, threads persistentes no PostgreSQL, cache/streams no Redis

**Tech Stack:** AdonisJS 7, `@adonisjs/redis`, `ai` + `@ai-sdk/openai`, React 19 + Inertia.js 2, SSE

---

### Task 1: Instalar e configurar Redis

**Files:**
- Modify: `package.json` (via ace)
- Create: `config/redis.ts`
- Create: `start/env.ts` (adicionar vars)

**Step 1: Instalar pacote Redis**

```bash
cd /home/dudousxd/personal/anua-v2
node ace add @adonisjs/redis
```

Expected: pacote instalado, `config/redis.ts` criado, provider registrado em `adonisrc.ts`

**Step 2: Verificar config/redis.ts**

```ts
// config/redis.ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: 'anua:',
    },
  },
})

export default redisConfig
```

**Step 3: Adicionar env vars**

Adicionar no `.env` (local) e registrar no arquivo de validação de env:

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

Verificar se existe `start/env.ts` (ou `app/validators/env.ts`). Se existir, adicionar validação:

```ts
REDIS_HOST: env.string('REDIS_HOST'),
REDIS_PORT: env.number('REDIS_PORT'),
REDIS_PASSWORD: env.string('REDIS_PASSWORD').optional(),
```

**Step 4: Testar Redis**

```bash
node ace repl
```

No REPL:
```ts
import redis from '@adonisjs/redis/services/main'
await redis.set('test', 'hello')
await redis.get('test')
await redis.del('test')
```

Expected: `'hello'` retornado.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add redis configuration"
```

---

### Task 2: Instalar AI SDK + Zod

**Files:**
- Modify: `package.json`

**Step 1: Instalar pacotes**

```bash
cd /home/dudoudxs/personal/anua-v2
npm install ai @ai-sdk/openai zod
```

**Step 2: Verificar instalação**

```bash
npm ls ai @ai-sdk/openai zod
```

Expected: versões listadas sem erro.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add AI SDK and zod packages"
```

---

### Task 3: Configurar variáveis CroF AI

**Files:**
- Modify: `.env`
- Modify: `start/env.ts` (ou equivalente)

**Step 1: Encontrar arquivo de validação de env**

```bash
find /home/dudousxd/personal/anua-v2 -name "env.ts" -path "*/start/*" 2>/dev/null
ls /home/dudousxd/personal/anua-v2/start/
```

**Step 2: Adicionar env vars**

No `.env`:
```env
CROF_API_URL=https://crof.ai/v1
CROF_API_KEY=
CROF_MODEL=gpt-4o
```

No validador de env (provavelmente `start/env.ts`):
```ts
CROF_API_URL: env.string('CROF_API_URL'),
CROF_API_KEY: env.string('CROF_API_KEY'),
CROF_MODEL: env.string('CROF_MODEL'),
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add CroF AI env vars"
```

---

### Task 4: Criar AiProvider

**Files:**
- Create: `app/ai/ai_provider.ts`

**Step 1: Criar diretório e arquivo**

```bash
mkdir -p /home/dudousxd/personal/anua-v2/app/ai
```

**Step 2: Escrever AiProvider**

```ts
// app/ai/ai_provider.ts
import { createOpenAI } from '@ai-sdk/openai'
import env from '#start/env'

let _provider: ReturnType<typeof createOpenAI> | null = null

export function getProvider() {
  if (!_provider) {
    _provider = createOpenAI({
      baseURL: env.get('CROF_API_URL', 'https://crof.ai/v1'),
      apiKey: env.get('CROF_API_KEY'),
    })
  }
  return _provider
}

export function getModel(model?: string) {
  const provider = getProvider()
  return provider(model ?? env.get('CROF_MODEL', 'gpt-4o'))
}
```

**Step 3: Commit**

```bash
git add app/ai/ai_provider.ts
git commit -m "feat: create CroF AI provider"
```

---

### Task 5: Criar Models de Thread (migration + Lucid)

**Files:**
- Create: `database/migrations/[timestamp]_create_ai_threads.ts`
- Create: `app/models/ai_thread.ts`
- Create: `database/migrations/[timestamp]_create_ai_thread_messages.ts`
- Create: `app/models/ai_thread_message.ts`

**Step 1: Criar migration de ai_threads**

```bash
cd /home/dudousxd/personal/anua-v2
node ace make:migration ai_threads
```

**Step 2: Escrever migration**

```ts
// database/migrations/[timestamp]_create_ai_threads.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_threads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('school_id').notNullable().references('id').inTable('schools')
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.string('persona', 50).notNullable().defaultTo('gestor')
      table.string('title', 255).nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 3: Criar model AiThread**

```ts
// app/models/ai_thread.ts
import { DateTime } from 'luxon'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import School from './school.js'
import User from './user.js'
import AiThreadMessage from './ai_thread_message.js'

export default class AiThread extends BaseModel {
  static table = 'ai_threads'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare userId: string

  @column()
  declare persona: string

  @column()
  declare title: string | null

  @column()
  declare metadata: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => AiThreadMessage)
  declare messages: HasMany<typeof AiThreadMessage>
}
```

**Step 4: Criar migration de ai_thread_messages**

```bash
node ace make:migration ai_thread_messages
```

**Step 5: Escrever migration**

```ts
// database/migrations/[timestamp]_create_ai_thread_messages.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_thread_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('thread_id').notNullable().references('id').inTable('ai_threads').onDelete('CASCADE')
      table.string('role', 20).notNullable()
      table.text('content').nullable()
      table.jsonb('tool_calls').nullable()
      table.jsonb('tool_results').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 6: Criar model AiThreadMessage**

```ts
// app/models/ai_thread_message.ts
import { DateTime } from 'luxon'
import { column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import AiThread from './ai_thread.js'

export default class AiThreadMessage extends BaseModel {
  static table = 'ai_thread_messages'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare threadId: string

  @column()
  declare role: 'user' | 'assistant' | 'system' | 'tool'

  @column()
  declare content: string | null

  @column()
  declare toolCalls: Record<string, any> | null

  @column()
  declare toolResults: Record<string, any> | null

  @column()
  declare metadata: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AiThread)
  declare thread: BelongsTo<typeof AiThread>
}
```

**Step 7: Rodar migrations no banco local**

```bash
node ace migration:run
```

Expected: tabelas `ai_threads` e `ai_thread_messages` criadas.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add ai_threads and ai_thread_messages models and migrations"
```

---

### Task 6: Criar Personas + Tool System

**Files:**
- Create: `app/ai/personas.ts`
- Create: `app/ai/tool.ts`
- Create: `app/ai/tool_registry.ts`

**Step 1: Criar personas.ts**

```ts
// app/ai/personas.ts
export interface Persona {
  id: string
  name: string
  systemPrompt: string
  allowedTools: string[]
}

export const personas: Record<string, Persona> = {
  gestor: {
    id: 'gestor',
    name: 'Assistente do Gestor',
    systemPrompt: `Você é um assistente de IA especializado em gestão escolar.
Você tem acesso aos dados da escola via ferramentas.
Sua função é analisar dados, gerar insights acionáveis e sugerir comunicações.
Seja direto, objetivo e baseie-se sempre nos dados reais da escola.
Quando sugerir uma comunicação, seja empático e profissional.
Sempre que possível, sugira ações concretas que o gestor pode tomar.`,
    allowedTools: ['getSchoolStats', 'getStudentAlerts', 'getFinancialData'],
  },

  comunicador: {
    id: 'comunicador',
    name: 'Assistente de Comunicação',
    systemPrompt: `Você gera comunicados personalizados para pais e responsáveis.
Seja empático, claro e objetivo.
Use os dados do aluno para personalizar a mensagem.
Nunca invente dados — use apenas as informações fornecidas pelas ferramentas.
O tom deve ser profissional mas acolhedor.`,
    allowedTools: ['getStudentAlerts'],
  },
}

export function getPersona(id: string): Persona {
  const persona = personas[id]
  if (!persona) throw new Error(`Persona not found: ${id}`)
  return persona
}
```

**Step 2: Criar tool helper**

```ts
// app/ai/tool.ts
import { tool as aiTool } from 'ai'
import { z } from 'zod'

export type ToolConfig = {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (args: any, ctx: Record<string, any>) => Promise<any>
}

export function defineTool(config: ToolConfig) {
  return {
    [config.name]: aiTool({
      description: config.description,
      parameters: config.parameters,
      execute: async (args) => config.execute(args, {}),
    }),
  }
}
```

**Step 3: Criar tool_registry.ts**

```ts
// app/ai/tool_registry.ts
class ToolRegistry {
  private personaTools = new Map<string, Record<string, any>>()
  private allToolNames = new Set<string>()

  register(personaId: string, toolDef: Record<string, any>) {
    const name = Object.keys(toolDef)[0]
    this.allToolNames.add(name)
    const existing = this.personaTools.get(personaId) ?? {}
    this.personaTools.set(personaId, { ...existing, ...toolDef })
  }

  forPersona(personaId: string): Record<string, any> {
    return this.personaTools.get(personaId) ?? {}
  }

  getToolNames(personaId: string): string[] {
    const tools = this.personaTools.get(personaId) ?? {}
    return Object.keys(tools)
  }
}

export const toolRegistry = new ToolRegistry()
```

**Step 4: Commit**

```bash
git add app/ai/personas.ts app/ai/tool.ts app/ai/tool_registry.ts
git commit -m "feat: create personas and tool registry"
```

---

### Task 7: Criar Tools (getStudentAlerts, getSchoolStats)

**Files:**
- Create: `app/ai/tools/get_student_alerts.ts`
- Create: `app/ai/tools/get_school_stats.ts`

**Step 1: Criar getStudentAlerts tool**

```ts
// app/ai/tools/get_student_alerts.ts
import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

export const getStudentAlerts = defineTool({
  name: 'getStudentAlerts',
  description: 'Obtém alertas pedagógicos atuais: alunos com risco por nota, frequência baixa, inadimplência. Retorna lista com nome, tipo de risco, descrição e prioridade.',
  parameters: z.object({
    schoolId: z.string().describe('ID da escola'),
    limit: z.number().default(10).describe('Máximo de alertas a retornar'),
  }),
  execute: async ({ schoolId, limit }) => {
    const overduePayments = await db
      .from('student_payments')
      .join('students', 'students.id', 'student_payments.student_id')
      .join('users', 'users.id', 'students.id')
      .where('users.school_id', schoolId)
      .where('student_payments.status', 'OVERDUE')
      .whereNull('users.deleted_at')
      .limit(limit)
      .select('users.name', 'student_payments.total_amount', 'student_payments.due_date')

    return {
      alerts: overduePayments.map((p) => ({
        type: 'financial',
        student: p.name,
        description: `Pagamento vencido de R$ ${(Number(p.total_amount) / 100).toFixed(2)}`,
        priority: 'high',
      })),
    }
  },
})

// FIXME: usar controllers reais depois — por enquanto query direta pra ter MVP rodando

toolRegistry.register('gestor', getStudentAlerts)
toolRegistry.register('comunicador', getStudentAlerts)
```

**Step 2: Criar getSchoolStats tool**

```ts
// app/ai/tools/get_school_stats.ts
import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

export const getSchoolStats = defineTool({
  name: 'getSchoolStats',
  description: 'Obtém estatísticas gerais da escola: total de alunos, professores, inadimplência, frequência média.',
  parameters: z.object({
    schoolId: z.string().describe('ID da escola'),
  }),
  execute: async ({ schoolId }) => {
    const studentCount = await db.from('students')
      .join('users', 'users.id', 'students.id')
      .where('users.school_id', schoolId)
      .whereNull('users.deleted_at')
      .count('* as total')
      .first()

    const overdueTotal = await db.from('student_payments')
      .join('students', 'students.id', 'student_payments.student_id')
      .join('users', 'users.id', 'students.id')
      .where('users.school_id', schoolId)
      .where('student_payments.status', 'OVERDUE')
      .sum('student_payments.total_amount as total')
      .first()

    return {
      totalStudents: Number(studentCount?.$extras?.total ?? studentCount?.total ?? 0),
      overdueAmountCents: Number(overdueTotal?.$extras?.total ?? overdueTotal?.total ?? 0),
    }
  },
})

toolRegistry.register('gestor', getSchoolStats)
```

**Step 3: Commit**

```bash
git add app/ai/tools/
git commit -m "feat: add AI tools for student alerts and school stats"
```

---

### Task 8: Criar AiService

**Files:**
- Create: `app/ai/ai_service.ts`

```ts
// app/ai/ai_service.ts
import { streamText, generateText, CoreMessage } from 'ai'
import { getModel } from './ai_provider.js'
import { getPersona } from './personas.js'
import { toolRegistry } from './tool_registry.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'
import { DateTime } from 'luxon'

export class AiService {
  async chat(threadId: string, message: string, personaId: string, ctx: { schoolId: string; userId: string }) {
    const persona = getPersona(personaId)
    const thread = await this.loadOrCreateThread(threadId, personaId, ctx)
    const history = await this.loadThreadHistory(thread.id)

    await AiThreadMessage.create({
      threadId: thread.id,
      role: 'user',
      content: message,
    })

    const result = streamText({
      model: getModel(),
      system: persona.systemPrompt,
      messages: [...history, { role: 'user', content: message }],
      tools: toolRegistry.forPersona(personaId),
      maxSteps: 10,
      onFinish: async ({ text, usage }) => {
        if (text) {
          await AiThreadMessage.create({
            threadId: thread.id,
            role: 'assistant',
            content: text,
          })
        }
        if (!thread.title) {
          this.generateThreadTitle(thread.id, message)
        }
      },
    })

    return result
  }

  async generate(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const { text } = await generateText({
      model: getModel('gpt-4o-mini'),
      system: systemPrompt,
      messages: messages as CoreMessage[],
    })
    return text
  }

  private async loadOrCreateThread(threadId: string | undefined, personaId: string, ctx: { schoolId: string; userId: string }) {
    if (threadId) {
      const thread = await AiThread.find(threadId)
      if (thread) return thread
    }
    return AiThread.create({
      schoolId: ctx.schoolId,
      userId: ctx.userId,
      persona: personaId,
    })
  }

  private async loadThreadHistory(threadId: string): Promise<CoreMessage[]> {
    const messages = await AiThreadMessage.query()
      .where('threadId', threadId)
      .orderBy('createdAt', 'asc')

    return messages.map((m) => ({
      role: m.role as CoreMessage['role'],
      content: m.content ?? '',
    }))
  }

  private async generateThreadTitle(threadId: string, firstMessage: string) {
    try {
      const { text } = await generateText({
        model: getModel('gpt-4o-mini'),
        system: 'Gere um título curto (máximo 6 palavras) para esta conversa. Responda apenas o título, sem aspas.',
        messages: [{ role: 'user', content: firstMessage }],
      })
      await AiThread.query().where('id', threadId).update({ title: text.trim() })
    } catch {
      // falha silenciosa — título não é crítico
    }
  }
}
```

**Step 2: Commit**

```bash
git add app/ai/ai_service.ts
git commit -m "feat: create AiService with chat and generate methods"
```

---

### Task 9: Criar Validators

**Files:**
- Create: `app/validators/ai.ts`

```ts
// app/validators/ai.ts
import vine from '@vinejs/vine'

export const chatValidator = vine.compile(
  vine.object({
    message: vine.string().min(1).max(4000),
    threadId: vine.string().uuid().optional(),
    persona: vine.string().in(['gestor', 'comunicador']).optional(),
  })
)

export const threadValidator = vine.compile(
  vine.object({
    persona: vine.string().in(['gestor', 'comunicador']).optional(),
  })
)
```

**Step 2: Commit**

```bash
git add app/validators/ai.ts
git commit -m "feat: add AI validators"
```

---

### Task 10: Criar ChatController (SSE streaming)

**Files:**
- Create: `app/controllers/ai/chat_controller.ts`

```ts
// app/controllers/ai/chat_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { AiService } from '#services/ai_service'
import { chatValidator } from '#validators/ai'

export default class ChatController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(chatValidator)
    const user = auth.user!
    const schoolId = user.schoolId

    if (!schoolId) {
      return response.badRequest({ error: 'Usuário sem escola vinculada' })
    }

    const aiService = new AiService()
    const result = await aiService.chat(
      payload.threadId,
      payload.message,
      payload.persona ?? 'gestor',
      { schoolId, userId: user.id }
    )

    return result.toDataStreamResponse()
  }
}
```

Wait — `app/services/` is the AdonisJS convention, but we put AiService in `app/ai/`. Let me adjust. The import should be:

```ts
import AiService from '#ai/ai_service'
```

Actually let me check if AdonisJS has aliases. Let me adjust the approach - we'll need to register the `#ai` alias or just use a relative import. Let me use a cleaner approach:

```ts
// app/controllers/ai/chat_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { AiService } from '../../ai/ai_service.js'
import { chatValidator } from '#validators/ai'

export default class ChatController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(chatValidator)
    const user = auth.user!
    const schoolId = user.schoolId

    if (!schoolId) {
      return response.badRequest({ error: 'Usuário sem escola vinculada' })
    }

    const aiService = new AiService()
    const result = await aiService.chat(
      payload.threadId,
      payload.message,
      payload.persona ?? 'gestor',
      { schoolId, userId: user.id }
    )

    return result.toDataStreamResponse()
  }
}
```

**Step 2: Commit**

```bash
git add app/controllers/ai/chat_controller.ts
git commit -m "feat: create chat controller with SSE streaming"
```

---

### Task 11: Criar ThreadsController (CRUD)

**Files:**
- Create: `app/controllers/ai/list_threads_controller.ts`
- Create: `app/controllers/ai/show_thread_controller.ts`
- Create: `app/controllers/ai/delete_thread_controller.ts`
- Create: `app/validators/ai.ts` (já existe, adicionar)

**Step 1: List threads**

```ts
// app/controllers/ai/list_threads_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'

export default class ListThreadsController {
  async handle({ auth }: HttpContext) {
    const user = auth.user!
    const threads = await AiThread.query()
      .where('userId', user.id)
      .preload('messages', (q) => q.orderBy('createdAt', 'desc').limit(1))
      .orderBy('updatedAt', 'desc')

    return threads.map((t) => ({
      id: t.id,
      title: t.title ?? 'Nova conversa',
      persona: t.persona,
      lastMessage: t.messages[0]?.content?.slice(0, 100) ?? '',
      updatedAt: t.updatedAt,
    }))
  }
}
```

**Step 2: Show thread**

```ts
// app/controllers/ai/show_thread_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'

export default class ShowThreadController {
  async handle({ params, auth, response }: HttpContext) {
    const thread = await AiThread.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .first()

    if (!thread) return response.notFound({ error: 'Thread não encontrada' })

    const messages = await AiThreadMessage.query()
      .where('threadId', thread.id)
      .orderBy('createdAt', 'asc')

    return { thread, messages }
  }
}
```

**Step 3: Delete thread**

```ts
// app/controllers/ai/delete_thread_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'

export default class DeleteThreadController {
  async handle({ params, auth, response }: HttpContext) {
    const thread = await AiThread.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .first()

    if (!thread) return response.notFound({ error: 'Thread não encontrada' })

    await thread.delete()
    return { success: true }
  }
}
```

**Step 4: Commit**

```bash
git add app/controllers/ai/
git commit -m "feat: create threads CRUD controllers"
```

---

### Task 12: Criar Routes

**Files:**
- Create: `start/routes/api/ai.ts`

**Step 1: Encontrar estrutura de rotas**

```bash
ls /home/dudousxd/personal/anua-v2/start/routes/api/
```

**Step 2: Criar arquivo de rotas**

```ts
// start/routes/api/ai.ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const Chat = () => import('#controllers/ai/chat_controller')
const ListThreads = () => import('#controllers/ai/list_threads_controller')
const ShowThread = () => import('#controllers/ai/show_thread_controller')
const DeleteThread = () => import('#controllers/ai/delete_thread_controller')

router.group(() => {
  router.post('/chat', [Chat])

  router.get('/threads', [ListThreads])
  router.get('/threads/:id', [ShowThread])
  router.delete('/threads/:id', [DeleteThread])
})
  .prefix('/api/v1/ai')
  .use(middleware.auth())
```

**Step 3: Verificar se o arquivo é importado**

Checar se `start/routes.ts` (ou similar) faz um scan automático dos arquivos em `start/routes/api/`. Se não, adicionar o import:

```ts
// start/routes.ts (adicionar no final)
await import('#start/routes/api/ai')
```

**Step 4: Commit**

```bash
git add start/routes/api/ai.ts
git commit -m "feat: add AI routes"
```

---

### Task 13: Frontend — Componente de Chat

**Files:**
- Create: `resources/js/components/ai/ai-chat.tsx`
- Create: `resources/js/components/ai/ai-message.tsx`
- Create: `resources/js/pages/escola/ai.tsx` (ou página existente do dashboard)
- Modify: `resources/js/pages/escola/dashboard.tsx` (adicionar acesso ao chat)

**Step 1: Verificar estrutura frontend**

```bash
ls /home/dudousxd/personal/anua-v2/resources/js/
```

**Step 2: Criar AiChat component**

```tsx
// resources/js/components/ai/ai-chat.tsx
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AiChatProps {
  persona?: 'gestor' | 'comunicador'
}

export function AiChat({ persona = 'gestor' }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          threadId,
          persona,
        }),
      })

      if (!response.ok) throw new Error('Erro ao enviar mensagem')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Sem suporte a streaming')

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:"')) {
            const content = line.slice(3, -1)
            assistantMessage.content += content
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center mt-8">
            Pergunte algo sobre a sua escola...
          </p>
        )}
        {messages.map((msg) => (
          <AiMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}

function AiMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
```

**Step 3: Adicionar página de IA no frontend**

```tsx
// resources/js/pages/escola/ai.tsx
import { AiChat } from '#components/ai/ai-chat'
import AppLayout from '#layouts/app'

interface Props {
  persona?: 'gestor' | 'comunicador'
}

export default function AiPage({ persona }: Props) {
  return (
    <AppLayout title="IA Assistente">
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Assistente IA</h1>
        <AiChat persona={persona ?? 'gestor'} />
      </div>
    </AppLayout>
  )
}
```

**Step 4: Adicionar rota de página**

```ts
// start/routes/pages/ (adicionar rota Inertia)
router.get('/escola/ia', [AiPageController])
```

Ou adicionar inline em uma rota existente de páginas.

**Step 5: Commit**

```bash
git add resources/js/components/ai/ resources/js/pages/escola/ai.tsx
git commit -m "feat: add AI chat frontend component and page"
```
---

## Resumo dos Commits

| # | Commit | Task |
|---|---|---|
| 1 | `feat: add redis configuration` | Redis setup |
| 2 | `feat: add AI SDK and zod packages` | npm install |
| 3 | `feat: add CroF AI env vars` | .env config |
| 4 | `feat: create CroF AI provider` | AiProvider |
| 5 | `feat: add thread models and migrations` | DB models |
| 6 | `feat: create personas and tool registry` | Personas + tools |
| 7 | `feat: add AI tools` | getStudentAlerts + getSchoolStats |
| 8 | `feat: create AiService` | Core service |
| 9 | `feat: add AI validators` | Validators |
| 10 | `feat: create chat controller` | SSE streaming |
| 11 | `feat: create threads CRUD controllers` | Threads |
| 12 | `feat: add AI routes` | API routes |
| 13 | `feat: add AI chat frontend` | React components |
