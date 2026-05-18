# IA no Anuá — Design de Sistema

## Contexto

O Anuá já se posiciona no mercado como um sistema de gestão escolar com IA, mas atualmente toda a "inteligência" é baseada em queries SQL com regras fixas (thresholds de notas, frequência, inadimplência). Não há integração com LLMs.

A oportunidade é dupla:

- **Comunicação Inteligente (A)**: Transformar alertas SQL em mensagens prontas em linguagem natural, personalizadas para cada pai/professor/gestor
- **Analytics Narrativo + Preditivo (C)**: Adicionar narrativa em linguagem natural aos insights existentes e prever evasão/inadimplência

## Stack

| Componente   | Tecnologia                                        |
| ------------ | ------------------------------------------------- |
| Provider LLM | CroF AI (OpenAI-compatible, `https://crof.ai/v1`) |
| AI SDK       | `ai` + `@ai-sdk/openai` (Vercel AI SDK)           |
| Cache/Stream | Redis 7.4 (`@adonisjs/redis`)                     |
| Fila         | `@adonisjs/queue` (database driver, já existente) |
| Backend      | AdonisJS 7                                        |
| Frontend     | React 19 + Inertia.js 2                           |

## Infraestrutura — Redis

Serviço gerenciado no Guara Cloud:

- **Service slug**: `anua-redis-34776a`
- **Host interno**: `anua-redis-34776a:6379`
- **Connection string**: `redis://:{password}@svc-24a1905b.proj-anu-04ecd7b8.svc.cluster.local:6379`
- **Storage**: 1GB persistente

### Configuração no AdonisJS

```bash
node ace add @adonisjs/redis
```

```ts
// config/redis.ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: env.get('REDIS_HOST', 'anua-redis-34776a'),
      port: env.get('REDIS_PORT', 6379),
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: 'anua:',
    },
  },
})

export default redisConfig
```

```env
REDIS_HOST=anua-redis-34776a
REDIS_PORT=6379
REDIS_PASSWORD=Mtlr9Ds8iL43vz6yFgYLaP8mLAo7WSoY
```

### Redis: resumable streams + rate limit

- **Resumable streams**: Armazenar chunks de stream do AI SDK no Redis (`anua:stream:{threadId}:{messageId}`) com TTL de 1h. Permite recuperar streams interrompidas por queda de conexão.
- **Rate limit**: Usar o `@adonisjs/limiter` (já instalado) com backend Redis para limitar requests de IA por escola/usuario.
- **Cache de prompts/narrativas**: Cachear narrativas de insights já geradas (`anua:narrative:{schoolId}:{date}`) para não regenerar a cada request.

## Estrutura de Diretórios

```
app/
  ai/
    ai_service.ts              # Core do chat: streamText, generate, persistência
    ai_provider.ts              # Factory do provider (CroF OpenAI)
    crof_client.ts              # HTTP client para CroF API (compatível OpenAI)
    tool_registry.ts            # Registro central de tools
    tool.ts                     # Helper para definir tools (tool() function)

    personas.ts                 # System prompts por persona
    prompts.ts                  # Templates de prompt reutilizáveis

    tools/
      get_school_stats.ts       # Tool: estatísticas da escola
      get_student_alerts.ts     # Tool: alertas pedagógicos atuais
      get_financial_data.ts     # Tool: dados financeiros
      get_prediction.ts         # Tool: predição de evasão/inadimplência
      send_communication.ts     # Tool: action (HITL) — enviar comunicado

    threads/
      thread_model.ts           # Model Lucid: ai_threads
      thread_message_model.ts   # Model Lucid: ai_thread_messages
      thread_service.ts         # CRUD de threads + histórico

    jobs/
      generate_insight_narrative.ts   # Job: gerar narrativa dos insights (fila)
      generate_daily_summary.ts       # Job: resumo diário da escola (06:00)
      retry_pending_narratives.ts     # Job: retentar narrativas que falharam

    controllers/
      chat_controller.ts        # POST /api/v1/ai/chat (streaming SSE)
      threads_controller.ts     # CRUD de threads
      communications_controller.ts  # Listar/minutar/enviar comunicados IA
      narratives_controller.ts  # GET narrativa dos insights

  validators/
    ai.ts                       # Validação dos inputs

  models/
    ai_thread.ts                # Model Lucid
    ai_thread_message.ts        # Model Lucid
    ai_communication.ts         # Model Lucid: comunicados gerados pela IA
```

### Models — Banco de Dados

```sql
-- threads de conversa com a IA
CREATE TABLE ai_threads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES schools(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  persona       VARCHAR(50) NOT NULL DEFAULT 'gestor',
  title         VARCHAR(255),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- mensagens de cada thread
CREATE TABLE ai_thread_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content       TEXT,
  tool_calls    JSONB,
  tool_results  JSONB,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- comunicados gerados pela IA (human-in-the-loop)
CREATE TABLE ai_communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools(id),
  alert_type      VARCHAR(50) NOT NULL,
  alert_data      JSONB NOT NULL,
  ai_generated    TEXT NOT NULL,
  edited_text     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'approved', 'sent', 'discarded')),
  channel         VARCHAR(20),
  recipient_ids   UUID[],
  sent_at         TIMESTAMPTZ,
  sent_by         UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- narrativas de insights cacheadas
CREATE TABLE ai_narratives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools(id),
  insight_type    VARCHAR(50) NOT NULL,
  insight_date    DATE NOT NULL,
  narrative       TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, insight_type, insight_date)
);
```

## Provider — CroF AI

CroF AI é um gateway que expõe uma API compatível com OpenAI. Usaremos `@ai-sdk/openai` apontando pra URL dele:

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

```env
CROF_API_URL=https://crof.ai/v1
CROF_API_KEY=sk-...
CROF_MODEL=gpt-4o
```

## AiService — Core

Inspirado no `chat.service.ts` do goflipai, adaptado pra AdonisJS:

```ts
// app/ai/ai_service.ts
import { streamText, generateText } from 'ai'
import { getModel } from './ai_provider.js'
import { getPersona } from './personas.js'
import { toolRegistry } from './tool_registry.js'

export class AiService {
  async chat(threadId: string, message: string, persona: string, ctx: AiContext) {
    const personaConfig = getPersona(persona)
    const thread = await this.loadOrCreateThread(threadId, ctx)
    const history = await this.loadThreadHistory(thread.id)

    const result = streamText({
      model: getModel(),
      system: personaConfig.systemPrompt,
      messages: [...history, { role: 'user', content: message }],
      tools: toolRegistry.forPersona(persona, ctx),
      maxSteps: 10,
      onFinish: async ({ text, usage }) => {
        await this.persistMessage(thread.id, 'assistant', text)
        await this.recordUsage(thread.id, usage)
        await this.generateTitleIfNeeded(thread)
      },
    })

    return result.toDataStreamResponse()
  }

  async generate(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const { text } = await generateText({
      model: getModel('gpt-4o-mini'), // modelo mais barato pra tasks simples
      system: systemPrompt,
      messages,
    })
    return text
  }
}
```

### Por que `generateText` vs `streamText`?

| Método         | Uso                                                                           |
| -------------- | ----------------------------------------------------------------------------- |
| `streamText`   | Chat interativo (SSE pro frontend). O usuário vê a resposta chegando.         |
| `generateText` | Jobs assíncronos (gerar narrativa, sumário diário). Não precisa de streaming. |

Usaremos `gpt-4o-mini` (mais barato) para jobs e narrativas, e `gpt-4o` para chat interativo.

## Personas

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
Quando sugerir uma comunicação para um pai/responsável, seja empático e profissional.
Sempre que possível, sugira ações concretas que o gestor pode tomar.`,
    allowedTools: [
      'getSchoolStats',
      'getStudentAlerts',
      'getFinancialData',
      'getPrediction',
      'sendCommunication',
    ],
  },

  comunicador: {
    id: 'comunicador',
    name: 'Assistente de Comunicação',
    systemPrompt: `Você gera comunicados personalizados para pais e responsáveis.
Seja empático, claro e objetivo.
Use os dados do aluno para personalizar a mensagem.
Nunca invente dados — use apenas as informações fornecidas pelas ferramentas.
O tom deve ser profissional mas acolhedor.`,
    allowedTools: ['getStudentAlerts', 'sendCommunication'],
  },
}
```

## Tools

Seguindo o pattern do goflipai mas adaptado pro AdonisJS (sem decorators):

```ts
// app/ai/tool.ts
import { tool as aiTool } from 'ai'
import { z } from 'zod'

export function tool(config: {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (args: any, ctx: AiContext) => Promise<any>
}) {
  return {
    [config.name]: aiTool({
      description: config.description,
      parameters: config.parameters,
      execute: async (args) => config.execute(args, {} as AiContext),
    }),
  }
}
```

```ts
// app/ai/tools/get_student_alerts.ts
import { z } from 'zod'
import { tool } from '../tool.js'

export const getStudentAlerts = tool({
  name: 'getStudentAlerts',
  description:
    'Obtém alertas pedagógicos atuais: alunos com risco por nota, frequência, inadimplência',
  parameters: z.object({
    schoolId: z.string().describe('ID da escola'),
    limit: z.number().default(10).describe('Máximo de alertas'),
  }),
  execute: async ({ schoolId, limit }) => {
    const controller = new GetPedagogicalAlertsController()
    const alerts = await controller.handle({
      selectedSchoolIds: [schoolId],
      request: { qs: () => ({}) } as any,
    } as any)
    return formatAlertsForAI(alerts)
  },
})
```

```ts
// app/ai/tool_registry.ts
class ToolRegistry {
  private tools = new Map<string, Record<string, any>>()
  private toolNames = new Map<string, string[]>()

  register(personaId: string, toolDef: Record<string, any>) {
    const name = Object.keys(toolDef)[0]
    this.tools.set(`${personaId}:${name}`, toolDef)
    const names = this.toolNames.get(personaId) || []
    names.push(name)
    this.toolNames.set(personaId, names)
  }

  forPersona(personaId: string, ctx: AiContext) {
    const names = this.toolNames.get(personaId) || []
    return names.reduce(
      (acc, name) => {
        const key = `${personaId}:${name}`
        const tool = this.tools.get(key)
        if (tool) Object.assign(acc, tool)
        return acc
      },
      {} as Record<string, any>
    )
  }
}

export const toolRegistry = new ToolRegistry()
```

## Fluxo — Comunicação Inteligente (Abordagem A)

### Como funciona

```
1. Dashboard carrega alertas SQL (já existe)
2. Botão "Gerar comunicado com IA" em cada alerta
3. Frontend chama POST /api/v1/ai/chat
   → system prompt: persona "comunicador"
   → message: "Gere um comunicado para o responsável do aluno João que está com 68% de frequência"
   → tool calls: getStudentAlerts (obter dados reais)
   → stream: IA escreve o comunicado em tempo real
4. Usuário vê a minuta, pode editar (human-in-the-loop)
5. Salva como ai_communication (status: draft)
6. Usuário confirma → status: approved
7. Envia via canal escolhido (WhatsApp/Email/SMS/Push)

Canais de envio já existem no sistema (notifications).
```

### Tela no Frontend

- Seção "Comunicados Inteligentes" no dashboard
- Lista de minutas geradas com status (draft/approved/sent)
- Preview do texto com opção de editar
- Botão "Enviar" com seletor de canal
- Chat aberto pra gerar comunicados customizados ("Cria um aviso sobre a reunião de pais pra turma do 5º ano")

### Job de Geração Automática

```ts
// app/ai/jobs/generate_daily_summary.ts
export class GenerateDailySummary extends BaseJob {
  async handle(schoolId: string) {
    // 1. Puxar insights atuais (SQL existente)
    const insights = await getInsights(schoolId)

    // 2. Mandar pro LLM gerar narrativa
    const narrative = await aiService.generate(persona.gestor.systemPrompt, [
      { role: 'user', content: `Resuma os insights de hoje:\n${JSON.stringify(insights)}` },
    ])

    // 3. Salvar no banco
    await AiNarrative.updateOrCreate(
      { schoolId, insightType: 'daily_summary', insightDate: today },
      { narrative, suggestedActions: actions }
    )
  }
}
```

Agendado no `start/scheduler.ts`:

```ts
// Todo dia às 06:00
Schedule.schedule('0 6 * * *', 'app/ai/jobs/generate_daily_summary')
```

## Fluxo — Analytics Narrativo + Preditivo (Abordagem C)

### Narrativa nos Insights

Hoje o endpoint `GET /api/v1/dashboard/insights` retorna:

```json
{
  "insights": [
    { "id": "overdue-payments", "title": "Pagamentos Vencidos", "value": 15, "priority": "high" }
  ]
}
```

Com IA, adicionar `aiNarrative` e `aiSuggestedActions`:

```json
{
  "insights": [
    {
      "id": "overdue-payments",
      "title": "Pagamentos Vencidos",
      "value": 15,
      "priority": "high",
      "aiNarrative": "Sua escola tem 15 boletos vencidos (R$ 4.200). Destes, 8 são de alunos com histórico de atraso crônico. Recomendo priorizar contato com os 5 casos acima de 30 dias.",
      "aiSuggestedActions": [
        "Enviar cobrança automática para os 15 devedores",
        "Agendar negociação com os 5 casos críticos"
      ]
    }
  ]
}
```

A narrativa é gerada por um job que roda após os insights serem calculados, e cacheada no Redis (`anua:narrative:{schoolId}:{date}`) + banco (`ai_narratives`).

### Predição via LLM

Para a predição, usamos a própria GPT-4o analisando os dados (sem ML tradicional por enquanto):

```ts
export const getPrediction = tool({
  name: 'getPrediction',
  description: 'Analisa dados históricos e faz predições sobre evasão, inadimplência ou desempenho',
  parameters: z.object({
    schoolId: z.string(),
    type: z.enum(['evasion', 'default', 'performance']),
  }),
  execute: async ({ schoolId, type }) => {
    // Puxa dados históricos dos controllers existentes
    const stats = await getEscolaStats(schoolId)
    const alerts = await getPedagogicalAlerts(schoolId)
    const trends = await getRevenueTrends(schoolId)

    // LLM analisa e retorna predições
    const prediction = await aiService.generate(
      `Você é um analista de dados educacionais. Analise os dados abaixo e retorne um JSON com:
      - risk_students: lista de alunos em risco com nome, risco (%), motivo principal
      - trends: tendências identificadas
      - recommendations: ações recomendadas`,
      [{ role: 'user', content: JSON.stringify({ stats, alerts, trends }) }]
    )

    return JSON.parse(prediction)
  },
})
```

## API Endpoints

```
POST   /api/v1/ai/chat                    # Chat com IA (streaming SSE)
GET    /api/v1/ai/threads                 # Listar threads
POST   /api/v1/ai/threads                 # Criar thread
GET    /api/v1/ai/threads/:id             # Ver thread + mensagens
DELETE /api/v1/ai/threads/:id             # Deletar thread

GET    /api/v1/ai/communications          # Listar comunicados gerados
POST   /api/v1/ai/communications          # Criar comunicado manualmente
PATCH  /api/v1/ai/communications/:id      # Editar / aprovar / descartar
POST   /api/v1/ai/communications/:id/send # Enviar comunicado

GET    /api/v1/ai/narratives              # Narrativas dos insights
GET    /api/v1/ai/narratives/today        # Narrativa do dia atual
```

## Plano de Implementação

### Sprint 1 — Setup + Chat (base)

- `node ace add @adonisjs/redis` + config
- Instalar `ai` + `@ai-sdk/openai`
- `AiService` + `AiProvider` + CroF API key
- Models: `ai_threads`, `ai_thread_messages`
- `ChatController` + streaming SSE
- Personas: `gestor`, `comunicador`
- Tool: `getStudentAlerts`, `getSchoolStats`
- Tool Registry
- Frontend: componente de chat no dashboard

### Sprint 2 — Comunicação Inteligente (A)

- `AiCommunication` model
- Prompt de geração de comunicados
- Human-in-the-loop: minuta → editar → aprovar → enviar
- Job `generateCommunications` automático
- Frontend: seção "Comunicados Inteligentes"

### Sprint 3 — Narrativa + Predição (C)

- `AiNarrative` model
- `generateDailySummary` job (06:00)
- Narrativa nos insights existentes
- Tool `getPrediction`
- Tool `getFinancialData`
- Cache no Redis
- Frontend: narrativa no dashboard + predições na sidebar

## Pacotes npm

```bash
# AI SDK
npm install ai @ai-sdk/openai

# Redis
node ace add @adonisjs/redis

# Zod (já deve estar instalado via VineJS, mas confirmar)
npm install zod
```

## Variáveis de Ambiente

```env
# CroF AI
CROF_API_URL=https://crof.ai/v1
CROF_API_KEY=sk-...
CROF_MODEL=gpt-4o

# Redis (Guara Cloud)
REDIS_HOST=anua-redis-34776a
REDIS_PORT=6379
REDIS_PASSWORD=Mtlr9Ds8iL43vz6yFgYLaP8mLAo7WSoY
```
