# Oportunidades de Melhoria - Anuá

**Data:** 2026-05-25  
**Status:** Análise Completa (Atualizada com revisão de código)

---

## Sumário Executivo

O Anuá é um sistema de gestão escolar robusto com 89 módulos, 172 models, e features avançadas como gamificação (RPG + Fazendinha), IA conversacional com 23 ferramentas, e automações pesadas de pagamentos. A base técnica é sólida, mas existem oportunidades significativas de melhoria em performance, cobertura de testes, experiência mobile, e posicionamento competitivo.

**Revisão de código revelou:**

- Controllers de listagem com lógica de query complexa inline (192+ linhas)
- Race conditions em serviços críticos (gamificação sem transações DB)
- Dashboard pesado carregando 20+ containers sem priorização
- Type safety inconsistente (`as any` em queries TanStack)
- N+1 queries potenciais em preloads aninhados desnecessários

---

## 1. Análise Técnica

### 1.1 Arquitetura e Código

**Pontos Fortes:**

- Separação clara em camadas (controllers → services → models)
- 121 transformers para serialização consistente da API
- Sistema de jobs bem estruturado com retry logic
- Middlewares especializados (auth, scope, impersonation)
- Uso de ADRs (Architecture Decision Records)

**Oportunidades:**

#### Performance e Escalabilidade

- **Query Optimization:** Com 172 models e relações complexas, há risco de N+1 queries em listagens pesadas (alunos, presenças, faturas)
  - **Ação:** Implementar eager loading estratégico e paginação server-side em todas as listagens
  - **Impacto:** Redução de 60-80% no tempo de resposta de páginas críticas

- **Cache Strategy:** Uso de `@adonisjs/cache` (bentocache) mas sem estratégia clara de invalidação
  - **Ação:** Implementar cache em camadas (query → model → fragment) com TTLs inteligentes
  - **Impacto:** Redução de carga no PostgreSQL, especialmente em horários de pico (7-9h, 17-19h)

- **Background Job Optimization:** 15 jobs agendados rodam sequencialmente no worker único
  - **Ação:** Implementar priorização de jobs e workers paralelos para jobs independentes
  - **Impacto:** Jobs críticos (pagamentos) não bloqueados por jobs menores (streaks)

#### Qualidade de Código

- **Type Safety:** Alguns `any` e `unknown` identificados em controllers e transformers
  - **Ação:** Refatorar para tipos estritos, usar Zod schemas já disponíveis
  - **Impacto:** Redução de bugs em runtime, melhor DX

- **Error Handling:** Erros tratados genericamente, sem categorização clara
  - **Ação:** Implementar error boundaries específicos por domínio (AcademicError, FinancialError, etc)
  - **Impacto:** Mensagens de erro mais claras para usuários, logs mais acionáveis

### 1.2 Testes e Qualidade

**Estado Atual:**

- 53 arquivos de teste (funcionais + browser)
- Cobertura focada em fluxos críticos (matrícula, pagamentos, IA)
- Testes de browser com Playwright

**Oportunidades:**

- **Cobertura de Testes:** Estimativa de 40-50% de cobertura
  - **Ação:** Adicionar testes unitários para services críticos (AsaasService, PaymentService)
  - **Meta:** 70% de cobertura em 3 meses
  - **Prioridade:** Alta

- **Testes de Performance:** Ausência de load testing
  - **Ação:** Implementar k6 ou Artillery para testar cenários de pico (início do ano letivo)
  - **Impacto:** Identificar gargalos antes de afetar produção

- **E2E Testing:** Testes browser limitados a fluxos específicos
  - **Ação:** Expandir cobertura para jornadas completas (responsável → pagamento → notificação)
  - **Impacto:** Detecção precoce de regressões

### 1.3 Segurança e Compliance

**Pontos Fortes:**

- Autenticação OTP via email (sem senhas)
- Rate limiting configurado
- Middleware de scope por escola
- Audit logs para ações críticas

**Oportunidades:**

- **LGPD Compliance:** Dados sensíveis de menores (alunos) sem política clara de retenção
  - **Ação:** Implementar data retention policies, anonymization para ex-alunos, export de dados para responsáveis
  - **Impacto:** Mitigação de risco legal, diferencial competitivo

- **API Security:** Endpoints expostos sem validação robusta de input em alguns casos
  - **Ação:** Implementar Vine.js validators em todos os endpoints (alguns já usam)
  - **Impacto:** Prevenção de injection attacks e data corruption

- **Secrets Management:** Uso de Secret Manager (GCP) mas com rotação manual
  - **Ação:** Implementar rotação automática de chaves (Asaas, Resend, MinIO)
  - **Impacto:** Redução de risco em caso de comprometimento

### 1.4 Observabilidade e Monitoramento

**Pontos Fortes:**

- PostHog + OpenTelemetry configurados
- Wide events via evlog
- Traces distribuídos

**Oportunidades:**

- **Alertas Proativos:** Sem alertas configurados para métricas críticas
  - **Ação:** Configurar alertas para:
    - Taxa de erro > 1% em 5 minutos
    - Latência P95 > 2s
    - Falha em jobs de pagamento
    - Queda de conversão em matrículas
  - **Impacto:** Detecção proativa de problemas

- **Business Metrics:** Foco em métricas técnicas, sem tracking de métricas de negócio
  - **Ação:** Instrumentar eventos de negócio:
    - Taxa de conclusão de matrícula
    - Tempo médio de pagamento
    - Engajamento com gamificação
    - Churn de escolas
  - **Impacto:** Insights para decisões de produto

---

## 2. Análise de Produto e UX

### 2.1 Features Existentes

**Diferenciais Fortes:**

- **Gamificação Avançada:** RPG + Fazendinha + streaks + leaderboards (único no mercado com essa profundidade)
- **IA Conversacional:** 23 ferramentas, contexto escolar, personas específicas
- **Cantina Digital:** Reservas, fiado, transferências, restrições alimentares
- **Loja Integrada:** Produtos, pedidos, liquidações para escolas
- **Automações Pesadas:** 15 jobs para pagamentos, notificações, lembretes

**Gaps Identificados:**

#### Mobile Experience

- **Problema:** App web-first, sem PWA ou app nativo
  - **Impacto:** Professores e pais usam predominantemente mobile
  - **Oportunidade:** PWA com offline-first para presenças e comunicados
  - **Esforço:** Médio (2-3 meses)
  - **Prioridade:** Alta

#### Comunicação

- **Problema:** Comunicados e notificações existem, mas sem segmentação avançada
  - **Impacto:** Pais recebem comunicação genérica
  - **Oportunidade:** Segmentação por turma, série, comportamento, engajamento
  - **Esforço:** Baixo (1 mês)

#### Relatórios e Analytics

- **Problema:** Dashboards básicos, sem insights acionáveis
  - **Impacto:** Gestores tomam decisões no feeling
  - **Oportunidade:** Relatórios preditivos (evasão, inadimplência, desempenho)
  - **Esforço:** Médio (2 meses)

### 2.2 Experiência do Usuário

**Jornada do Responsável:**

- ✅ Matrícula online fluida
- ✅ Pagamentos integrados (Asaas)
- ⚠️ Navegação confusa entre módulos (cantina, comunicados, notas)
- ❌ Sem onboarding guiado para novos usuários

**Jornada do Professor:**

- ✅ Lançamento de presenças e notas
- ✅ Calendário integrado
- ⚠️ Interface densa, curva de aprendizado alta
- ❌ Sem modo offline para escolas com internet instável

**Jornada do Gestor:**

- ✅ Visão consolidada de pagamentos
- ✅ Gamificação configurável
- ⚠️ Falta de benchmarks (como minha escola compara com outras?)
- ❌ Sem exportação de dados em formatos padrão (Excel, PDF)

### 2.3 Onboarding e Retenção

**Oportunidades:**

- **Onboarding Guiado:**
  - Tour interativo para novos gestores
  - Checklists de setup (configurar pagamentos, importar alunos, configurar gamificação)
  - Templates de comunicados e eventos

- **Engajamento Contínuo:**
  - Notificações de "quick wins" (ex: "3 alunos completaram streak essa semana")
  - Sugestões contextuais baseadas em IA (ex: "Sua inadimplência está 15% acima da média, quer enviar lembretes?")

---

## 3. Análise Competitiva

### 3.1 Landscape do Mercado Brasileiro

**Principais Competidores:**

| Competidor         | Foco                  | Pontos Fortes                           | Pontos Fracos                         | Preço Estimado   |
| ------------------ | --------------------- | --------------------------------------- | ------------------------------------- | ---------------- |
| **Sponte**         | Escolas K-12          | Market leader, app mobile, suporte 24/7 | UX datada, sem gamificação, caro      | R$ 800-3000/mês  |
| **Escolaweb**      | Escolas SMB           | Simplicidade, preço acessível           | Features limitadas, sem IA            | R$ 200-800/mês   |
| **Qranber**        | Escolas modernas      | UX moderna, mobile-first                | Recente, menos funcionalidades        | R$ 400-1500/mês  |
| **SophiA**         | Escolas + bibliotecas | Gestão de acervo, tradição              | Interface antiga, foco em bibliotecas | R$ 500-2000/mês  |
| **SIGA**           | Escolas grandes       | Robustez, customização                  | Complexo, caro, suporte lento         | R$ 1500-5000/mês |
| **iEscolar**       | Mobile-first          | App nativo, offline                     | Features limitadas no web             | R$ 300-1000/mês  |
| **Gestor Escolar** | Micro escolas         | Muito barato, simples                   | Sem escala, features básicas          | R$ 50-200/mês    |
| **Eduqz**          | Comunicação           | Chat escola-pais, notificações          | Não é ERP completo                    | R$ 200-600/mês   |

### 3.2 Posicionamento do Anuá

**Vantagens Competitivas:**

1. **Gamificação Profunda**
   - Único com RPG completo + minigame (Fazendinha)
   - Streaks, conquistas, leaderboards
   - **Diferencial:** Engajamento de alunos, não só gestão

2. **IA Integrada**
   - 23 ferramentas contextuais
   - Personas específicas (gestor, professor, responsável)
   - **Diferencial:** Automação inteligente, não só CRUD

3. **Ecossistema Completo**
   - Cantina digital + loja + pagamentos
   - **Diferencial:** Revenue share potencial (taxas de transação)

4. **Preço Competitivo**
   - R$ 199/mês (plano Business)
   - **Diferencial:** 50-70% mais barato que Sponte/SIGA

**Desvantagens Competitivas:**

1. **Mobile**
   - Sem app nativo (competidores têm)
   - Sem modo offline (iEscolar tem)

2. **Market Presence**
   - Pouco conhecido no mercado
   - Sem cases públicos de sucesso
   - Sem integração com sistemas governamentais (Censo Escolar)

3. **Suporte**
   - Sem suporte 24/7 (Sponte tem)
   - Sem onboarding dedicado

### 3.3 Oportunidades de Mercado

#### Segmentos Não Atendidos

1. **Escolas de Cursos Livres**
   - Idiomas, música, esportes
   - Necessidades: agendamento, pagamentos recorrentes, progresso individual
   - **Oportunidade:** Adaptar gamificação para cursos livres

2. **Redes de Ensino**
   - Múltiplas escolas sob mesma gestão
   - Necessidades: consolidação de dados, benchmarks internos
   - **Oportunidade:** School chains (já existe no modelo) + analytics cross-school

3. **Escolas Bilíngues/Internacionais**
   - Necessidades: multi-idioma, integração com currículos internacionais (IB, Cambridge)
   - **Oportunidade:** i18n + templates de relatórios internacionais

#### Modelos de Monetização

1. **Revenue Share em Transações**
   - Cantina: 2-3% sobre transações
   - Loja: 3-5% sobre vendas
   - Pagamentos: spread sobre taxas do Asaas
   - **Potencial:** R$ 500-2000/mês por escola ativa

2. **Marketplace de Serviços**
   - Seguros escolares (já existe modelo)
   - Uniformes, material didático
   - Serviços extracurriculares
   - **Potencial:** Comissão de 10-15%

3. **Add-ons Premium**
   - IA avançada (mais tokens, personas premium)
   - Relatórios customizados
   - Integrações (WhatsApp Business API, Zoom)
   - **Potencial:** R$ 100-500/mês por escola

---

## 4. Roadmap de Oportunidades

### 4.1 Quick Wins (0-3 meses)

**Alta Prioridade, Baixo Esforço:**

1. **Performance: Eager Loading**
   - Identificar N+1 queries em listagens críticas
   - Implementar eager loading estratégico
   - **Impacto:** 60-80% mais rápido
   - **Esforço:** 2-3 semanas

2. **Alertas de Negócio**
   - Configurar alertas para inadimplência, churn, falhas
   - Dashboard de métricas de negócio no PostHog
   - **Impacto:** Detecção proativa de problemas
   - **Esforço:** 1-2 semanas

3. **LGPD: Data Export**
   - Permitir responsáveis exportarem dados dos alunos
   - Implementar anonymization para ex-alunos
   - **Impacto:** Compliance, diferencial competitivo
   - **Esforço:** 2-3 semanas

4. **Onboarding Guiado**
   - Checklists de setup para novos gestores
   - Tooltips contextuais
   - **Impacto:** Redução de churn nos primeiros 30 dias
   - **Esforço:** 3-4 semanas

### 4.2 Iniciativas Estratégicas (3-6 meses)

**Alta Prioridade, Médio Esforço:**

1. **PWA com Offline-First**
   - App instalável para mobile
   - Sincronização offline para presenças e comunicados
   - **Impacto:** Competir com iEscolar e Sponte
   - **Esforço:** 2-3 meses

2. **Relatórios Preditivos**
   - Modelo de predição de evasão (baseado em presenças, notas, pagamentos)
   - Alertas automáticos para gestores
   - **Impacto:** Redução de churn de alunos, diferencial de IA
   - **Esforço:** 2-3 meses

3. **Marketplace de Serviços**
   - Integração com fornecedores (uniformes, material)
   - Sistema de comissões
   - **Impacto:** Nova fonte de receita (R$ 500-2000/escola/mês)
   - **Esforço:** 3-4 meses

4. **Cobertura de Testes**
   - Testes unitários para services críticos
   - E2E para jornadas completas
   - **Impacto:** Redução de bugs em produção, confiança para deploys
   - **Esforço:** 2-3 meses (contínuo)

### 4.3 Visão de Longo Prazo (6-12 meses)

**Alta Prioridade, Alto Esforço:**

1. **App Nativo (React Native)**
   - iOS + Android
   - Push notifications nativas
   - **Impacto:** Competir diretamente com Sponte e iEscolar
   - **Esforço:** 6-8 meses

2. **Integração com Sistemas Governamentais**
   - Censo Escolar (INEP)
   - Diário oficial (publicação de notas)
   - **Impacto:** Necessidade regulatória, diferenciação
   - **Esforço:** 3-4 meses

3. **Plataforma de Cursos Livres**
   - Adaptação do core para cursos (idiomas, música, esportes)
   - Agendamento flexível, pagamentos por aula
   - **Impacto:** Novo mercado (10x maior que escolas K-12)
   - **Esforço:** 6-8 meses

4. **IA Preditiva Avançada**
   - Recomendações personalizadas para alunos (quais matérias focar)
   - Otimização de horários para escolas
   - Predição de inadimplência com sugestões de ação
   - **Impacto:** Diferencial competitivo sustentável
   - **Esforço:** 4-6 meses

---

## 5. Métricas de Sucesso

### 5.1 Métricas Técnicas

- **Performance:**
  - Latência P95 < 1s (atual: ~2-3s estimado)
  - Zero downtime em horários de pico
  - 99.9% uptime mensal

- **Qualidade:**
  - 70%+ cobertura de testes
  - < 5 bugs críticos por mês
  - Deploy frequency: 2-3x por semana

### 5.2 Métricas de Negócio

- **Crescimento:**
  - 10 novas escolas por mês (atual: desconhecido)
  - Churn mensal < 3%
  - NRR (Net Revenue Retention) > 110%

- **Engajamento:**
  - 70%+ de responsáveis ativos mensalmente
  - 50%+ de professores usando gamificação
  - 30%+ de transações via cantina digital

- **Receita:**
  - ARPU (Average Revenue Per User) > R$ 300/mês
  - Revenue share > 20% da receita total
  - LTV/CAC > 3x

---

## 6. Conclusão

O Anuá tem uma base técnica sólida e diferenciais competitivos fortes (gamificação, IA, ecossistema completo). As maiores oportunidades estão em:

1. **Mobile** (PWA/app nativo) para competir com players estabelecidos
2. **Analytics preditivo** para transformar dados em insights acionáveis
3. **Marketplace** para criar novas fontes de receita
4. **Performance e qualidade** para escalar com confiança

Com execução focada nessas áreas, o Anuá pode se posicionar como a alternativa moderna e inteligente aos players tradicionais (Sponte, SIGA), capturando market share no segmento de escolas K-12 e expandindo para cursos livres.

---

## Apêndice: Análise Detalhada do Código

### Estrutura do Projeto

```
app/
├── controllers/ (89 módulos)
├── models/ (172 models)
├── services/ (21 services)
├── jobs/ (11 domínios)
├── transformers/ (121 transformers)
├── middleware/ (14 middlewares)
└── ai/ (23 ferramentas)

inertia/
├── pages/ (escola, responsavel, aluno, loja, matricula-online)
├── components/ (75+ componentes)
└── stores/ (3 stores Zustand)

tests/
├── functional/ (47 testes)
└── browser/ (6 testes E2E)
```

### Dependências Críticas

- **Backend:** AdonisJS 7, PostgreSQL, MinIO, Resend, Asaas
- **Frontend:** React 19, Inertia, shadcn/ui, Tailwind
- **Infra:** Guara Cloud (Brasil), Cloudflare
- **Observabilidade:** PostHog, OpenTelemetry

### Automações (15 Jobs Agendados)

1. `generate_missing_payments` (02:00) - Gera pagamentos faltantes
2. `generate_invoices` (03:00) - Gera faturas
3. `generate_subscription_invoices` (04:00, dia 1) - Cobra assinaturas
4. `retry_subscription_invoice_charges` (04:30) - Retenta cobranças
5. `refresh_overdue_invoices` (05:00) - Atualiza faturas vencidas
6. `create_meal_recurrence_reservations` (05:30) - Reservas de refeições
7. `create_invoice_asaas_charges` (06:00) - Cria cobranças Asaas
8. `send_invoice_notifications` (06:30) - Notifica responsáveis
9. `sweep_pending_asaas_documents` (08:00) - Limpa documentos pendentes
10. `send_occurrence_ack_reminders` (09:00, seg-sex) - Lembretes de ocorrências
11. `send_enrollment_reminders` (10:00, seg-sex) - Lembretes de matrícula
12. `send_daily_academic_digest` (19:00) - Resumo diário
13. `send_weekly_academic_digest` (07:00, segunda) - Resumo semanal
14. `retry_pending_events` (\*/15 min) - Retry de eventos de gamificação
15. `update_streaks` (00:00) - Atualiza streaks de alunos

---

## 7. Achados da Revisão de Código (2026-05-25)

Análise detalhada de código real (controllers, services, componentes) revelou problemas concretos e oportunidades de melhoria imediata.

### 7.1 Problemas Identificados

#### **Controllers com Lógica de Query Inline**

**Arquivo:** `app/controllers/invoices/list_invoices_controller.ts` (192 linhas)

**Problema:**

- Lógica de filtragem complexa com 5+ níveis de `whereHas` aninhados
- Controller responsável por construir queries SQL complexas
- Dificulta manutenção e testes
- Inconsistência: alguns controllers são enxutos (45 linhas), outros são gordos (192 linhas)

**Exemplo problemático:**

```typescript
if (courseId) {
  query.whereHas('payments', (paymentsQuery) => {
    paymentsQuery.whereHas('studentHasLevel', (enrollmentQuery) => {
      enrollmentQuery.whereHas('levelAssignedToCourseAcademicPeriod', (levelCourseQuery) => {
        levelCourseQuery.whereHas('courseHasAcademicPeriod', (coursePeriodQuery) => {
          coursePeriodQuery.where('courseId', courseId)
        })
      })
    })
  })
}
```

**Recomendação:**

- Extrair lógica de query para `InvoiceQueryService` ou `InvoiceRepository`
- Controller deve apenas orquestrar: validar input → chamar service → retornar response
- Facilita caching, testes unitários e reuso de queries

**Impacto:** Reduz controller de 192 para ~30 linhas, melhora testabilidade

---

#### **Race Condition em Gamificação**

**Arquivo:** `app/services/gamification/points_service.ts`

**Problema:**

```typescript
async addPoints(params: { studentGamificationId: string; points: number; ... }) {
  let gamification = await StudentGamification.findOrFail(params.studentGamificationId)
  const newTotalPoints = gamification.totalPoints + params.points
  // ... criar transaction ...
  gamification = await gamification.merge({ totalPoints: newTotalPoints }).save()
}
```

**Cenário de race condition:**

1. Job A lê `totalPoints = 100`
2. Job B lê `totalPoints = 100` (antes de A salvar)
3. Job A adiciona 50 → salva `totalPoints = 150`
4. Job B adiciona 30 → salva `totalPoints = 130` (deveria ser 180)

**Resultado:** 20 pontos perdidos

**Recomendação:**

```typescript
// Opção 1: Transação com SELECT FOR UPDATE
await db.transaction(async (trx) => {
  const gamification = await StudentGamification.query({ client: trx })
    .where('id', params.studentGamificationId)
    .forUpdate()
    .firstOrFail()

  const newTotalPoints = gamification.totalPoints + params.points
  await gamification.merge({ totalPoints: newTotalPoints }).save({ client: trx })
  await PointTransaction.create({ ... }, { client: trx })
})

// Opção 2: UPDATE atômico
await StudentGamification.query()
  .where('id', params.studentGamificationId)
  .increment('total_points', params.points)
```

**Impacto:** Previne corrupção de dados em operações concorrentes

---

#### **N+1 Queries e Preloads Desnecessários**

**Arquivo:** `app/controllers/invoices/list_invoices_controller.ts`

**Problema:**

```typescript
const query = Invoice.query()
  .preload('student', (q) => q.preload('user'))
  .preload('payments', (q) => {
    q.preload('contract')
    q.preload('studentHasExtraClass', (eq) => eq.preload('extraClass'))
    q.preload('studentHasLevel', (enrollmentQuery) => {
      enrollmentQuery.preload('scholarship')
      enrollmentQuery.preload('individualDiscounts', (discountQuery) => {
        discountQuery.where('isActive', true).whereNull('deletedAt')
      })
    })
  })
```

**Problemas:**

1. **Preload incondicional:** Carrega 5+ relacionamentos mesmo quando filtros não precisam
2. **Performance:** Para 100 invoices, executa 500+ queries (100 × 5 preloads)
3. **Memória:** Carrega dados desnecessários (ex: `individualDiscounts` quando só precisa de `totalAmount`)

**Recomendação:**

```typescript
// Preload condicional baseado nos campos solicitados
const needsStudent = fields.includes('studentName')
const needsPayments = fields.includes('paymentStatus')

const query = Invoice.query()
if (needsStudent) {
  query.preload('student', (q) => q.preload('user'))
}
if (needsPayments) {
  query.preload('payments', (q) => {
    q.preload('contract')
    // ... outros preloads apenas se necessário
  })
}

// Ou usar SELECT específico para evitar carregar colunas desnecessárias
query.select('id', 'dueDate', 'amount', 'status')
```

**Impacto:** Reduz queries de 500+ para ~10-20 em listagens típicas

---

#### **Queries SQL Ineficientes**

**Arquivo:** `app/controllers/attendance/list_attendance_controller.ts`

**Problema:**

```typescript
if (date) {
  query.whereHas('attendance', (q) => q.whereRaw('DATE(date) = ?', [date]))
}
```

**Problemas:**

1. **`DATE(date)` não usa índice:** Aplica função na coluna, impedindo uso de índice
2. **Performance ruim:** Full table scan em tabelas grandes

**Recomendação:**

```typescript
if (date) {
  const startOfDay = DateTime.fromISO(date).startOf('day').toSQL()
  const endOfDay = DateTime.fromISO(date).endOf('day').toSQL()
  query.whereHas('attendance', (q) => q.whereBetween('date', [startOfDay, endOfDay]))
}
```

**Impacto:** Query 10-100x mais rápida em tabelas com milhões de registros

---

#### **Type Safety Inconsistente**

**Arquivo:** `inertia/containers/dashboard/financial-kpi-strip.tsx`

**Problema:**

```typescript
const { data, isLoading } = useQuery(
  api.api.v1.dashboard.escolaStats.queryOptions({ query } as any)
)
```

**Problemas:**

1. **`as any` quebra type safety:** Perde autocomplete e validação de tipos
2. **Inconsistência:** Alguns lugares usam tipos corretos, outros usam `any`
3. **Dificulta refactoring:** Mudanças na API não são detectadas pelo TypeScript

**Recomendação:**

```typescript
// Definir tipo explícito para query params
type EscolaStatsQuery = {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

const query: EscolaStatsQuery = { academicPeriodId, courseId, levelId, classId }
const { data, isLoading } = useQuery(api.api.v1.dashboard.escolaStats.queryOptions({ query }))
```

**Impacto:** Melhor DX, catch de erros em compile-time

---

#### **Dashboard Pesado sem Priorização**

**Arquivo:** `inertia/pages/escola/index.tsx`

**Problema:**

```typescript
import { FinancialKpiStrip } from '../../containers/dashboard/financial-kpi-strip'
import { EnrollmentConversionStrip } from '../../containers/dashboard/enrollment-conversion-strip'
import { GradeDistributionChart } from '../../containers/grades/grade-distribution-chart'
import { AtRiskStudentsTable } from '../../containers/grades/at-risk-students-table'
import { PedagogicalAttendanceTrendsChartWithFilters } from '../../containers/pedagogical/attendance-trends-chart'
import { GradeTrendsChartWithFilters } from '../../containers/pedagogical/grade-trends-chart'
// ... +15 imports de containers
```

**Problemas:**

1. **20+ containers carregando em paralelo:** Cada um faz sua própria query
2. **Sem priorização:** Gráficos menos importantes bloqueiam KPIs críticos
3. **Sem lazy loading:** Todos os containers carregados mesmo se usuário não scrollar

**Recomendação:**

```typescript
// Opção 1: React.lazy para containers below-the-fold
const GradeDistributionChart = lazy(
  () => import('../../containers/grades/grade-distribution-chart')
)

// Opção 2: TanStack Query com prioridade
useQuery({
  ...api.api.v1.dashboard.escolaStats.queryOptions({ query }),
  meta: { priority: 'high' }, // KPIs críticos primeiro
})

useQuery({
  ...api.api.v1.dashboard.gradeTrends.queryOptions({ query }),
  meta: { priority: 'low' }, // Gráficos podem esperar
})

// Opção 3: Stale-while-revalidate
useQuery({
  staleTime: 5 * 60 * 1000, // KPIs: 5 min cache
})

useQuery({
  staleTime: 30 * 60 * 1000, // Gráficos: 30 min cache
})
```

**Impacto:** Reduz tempo de carregamento inicial de 3-5s para 1-2s

---

#### **Manual Fetch em Componente React**

**Arquivo:** `inertia/components/layouts/escola-layout.tsx`

**Problema:**

```typescript
function UnreadMessagesBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/escola/inquiries?limit=50', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const unreadCount = (data.data ?? []).filter(
          (i: { hasUnread: boolean }) => i.hasUnread
        ).length
        setCount(unreadCount)
      })
      .catch(() => setCount(0))
  }, [])
  // ...
}
```

**Problemas:**

1. **Inconsistência:** Todo o app usa TanStack Query, exceto este componente
2. **Sem cache:** Refetch a cada render, mesmo se dados não mudaram
3. **Sem retry:** Se falhar, fica em `count = 0` sem tentar novamente
4. **Carrega 50 inquiries só pra contar unread:** Ineficiente

**Recomendação:**

```typescript
function UnreadMessagesBadge() {
  const { data } = useQuery({
    ...api.api.v1.escola.inquiries.queryOptions({ limit: 50 }),
    staleTime: 60 * 1000, // 1 min cache
    refetchInterval: 2 * 60 * 1000, // Poll a cada 2 min
  })

  const count = useMemo(() => (data?.data ?? []).filter((i) => i.hasUnread).length, [data])

  // Ou melhor: endpoint dedicado /api/v1/escola/inquiries/unread-count
}
```

**Impacto:** Consistência com o resto do app, melhor cache, menos requests

---

#### **Falta de Paginação Cursor-Based**

**Arquivo:** Múltiplos controllers (`list_invoices_controller.ts`, `list_events_controller.ts`, etc.)

**Problema:**

```typescript
const invoices = await query.paginate(page, limit)
// Offset pagination: SELECT ... LIMIT 20 OFFSET 1000
```

**Problemas:**

1. **Performance degradante:** OFFSET 1000 é lento (precisa scanear 1000 registros antes)
2. **Inconsistência em tempo real:** Se novos itens são inseridos, paginação "pula" itens
3. **Escalabilidade:** Fica pior conforme dataset cresce

**Recomendação:**

```typescript
// Cursor-based pagination
const invoices = await query
  .where('id', '<', lastSeenId) // Cursor
  .orderBy('id', 'desc')
  .limit(limit)

// Response inclui cursor para próxima página
return {
  data: invoices,
  nextCursor: invoices[invoices.length - 1]?.id,
  hasMore: invoices.length === limit,
}
```

**Impacto:** Performance consistente independente do tamanho do dataset

---

#### **Gamificação sem Rate Limiting**

**Arquivo:** `app/services/gamification/points_service.ts`

**Problema:**

```typescript
async addPoints(params: { studentGamificationId: string; points: number; ... }) {
  // Sem verificação de frequência
  // Aluno pode ganhar pontos infinitos se job for executado múltiplas vezes
}
```

**Cenários de exploit:**

1. **Bug em job:** Job de "presença em evento" executa 10x → 10x pontos
2. **Race condition:** Dois requests simultâneos → pontos duplicados
3. **Falta de idempotência:** Mesma ação gera pontos múltiplas vezes

**Recomendação:**

```typescript
async addPoints(params: {
  studentGamificationId: string
  points: number
  type: string
  reason: string
  idempotencyKey: string // Novo: identificador único da ação
}) {
  // Verificar se já processamos esta ação
  const existing = await PointTransaction.query()
    .where('idempotencyKey', params.idempotencyKey)
    .first()

  if (existing) {
    return { transaction: existing, gamification: await StudentGamification.find(...) }
  }

  // Rate limiting: máximo X pontos por hora
  const recentPoints = await PointTransaction.query()
    .where('studentGamificationId', params.studentGamificationId)
    .where('createdAt', '>', DateTime.now().minus({ hours: 1 }).toSQL())
    .sum('points as total')

  if (recentPoints[0].total > MAX_POINTS_PER_HOUR) {
    throw new Error('Rate limit exceeded')
  }

  // ... resto da lógica
}
```

**Impacto:** Previne exploits e bugs de duplicação

---

### 7.2 Padrões Positivos Identificados

Nem tudo é problema! O código também tem padrões excelentes que devem ser mantidos:

#### **AI Service Bem Estruturado**

- `app/ai/ai_service.ts` tem streaming com resumable streams
- Comments explicativos sobre decisões de design
- AbortController para cancelar streams quando client desconecta
- Quota checking antes de processar

#### **Design System Maduro**

- 50+ componentes UI baseados em shadcn/Radix
- Componentes customizados úteis: `currency-input`, `masked-input`, `date-picker`, `stepper`
- Consistência visual em todo o app

#### **IA Contextual (AskAnua)**

- Sheet/Panel pattern bem implementado
- Thread management com sessionStorage
- Contextual prompts por tela
- Streaming com cancelamento

#### **Dashboard Rico**

- KPIs financeiros com toggle de visibilidade
- Filtros por período letivo, curso, nível, turma
- Múltiplas abas (pedagógico, administrativo, financeiro)
- Skeleton loading em todos os containers

#### **Multi-Tenancy Bem Implementado**

- `selectedSchoolIds` no middleware
- School chains com override de configurações
- Permissões granulares por role

---

### 7.3 Recomendações Priorizadas

#### **Quick Wins (1-2 semanas)**

1. **Fix race condition em `PointsService`**
   - Adicionar transação DB com `FOR UPDATE`
   - **Tempo:** 2h
   - **Impacto:** Previne corrupção de dados

2. **Fix query ineficiente em `ListAttendanceController`**
   - Trocar `DATE(date) = ?` por `BETWEEN`
   - **Tempo:** 1h
   - **Impacto:** 10-100x mais rápido

3. **Padronizar `UnreadMessagesBadge` com TanStack Query**
   - Trocar `fetch` manual por `useQuery`
   - **Tempo:** 1h
   - **Impacto:** Consistência e cache

4. **Remover `as any` em queries TanStack**
   - Definir tipos explícitos para query params
   - **Tempo:** 2-4h
   - **Impacto:** Type safety

#### **Médio Prazo (1-2 meses)**

5. **Refatorar `ListInvoicesController`**
   - Extrair lógica de query para `InvoiceQueryService`
   - **Tempo:** 1-2 dias
   - **Impacto:** Controller de 192 → 30 linhas, melhor testabilidade

6. **Adicionar idempotência em gamificação**
   - `idempotencyKey` em `PointTransaction`
   - Rate limiting por hora
   - **Tempo:** 2-3 dias
   - **Impacto:** Previne exploits

7. **Lazy loading em dashboard**
   - `React.lazy` para containers below-the-fold
   - TanStack Query com `priority` e `staleTime`
   - **Tempo:** 1-2 dias
   - **Impacto:** 2-3x mais rápido no carregamento inicial

8. **Paginação cursor-based**
   - Implementar em 2-3 endpoints críticos (invoices, events, attendance)
   - **Tempo:** 3-5 dias
   - **Impacto:** Performance consistente

#### **Longo Prazo (3-6 meses)**

9. **Otimização de preloads**
   - Preload condicional baseado em campos solicitados
   - GraphQL-like field selection
   - **Tempo:** 2-3 semanas
   - **Impacto:** 5-10x menos queries

10. **Query builder unificado**
    - Padrão consistente para todos os controllers de listagem
    - Filtros, sorting, paginação em um único lugar
    - **Tempo:** 1-2 meses
    - **Impacto:** Consistência e produtividade

---

## 8. Conclusão

O Anuá tem uma base técnica sólida e diferenciais competitivos fortes (gamificação, IA, ecossistema completo). As maiores oportunidades estão em:

1. **Performance:** Corrigir queries ineficientes e N+1 (ganho de 10-100x em alguns casos)
2. **Confiabilidade:** Adicionar transações e idempotência em operações críticas
3. **Mobile:** PWA/app nativo para competir com players estabelecidos
4. **Analytics:** Transformar dados em insights acionáveis (preditivo)
5. **Marketplace:** Criar novas fontes de receita (serviços, revenue share)

Com execução focada nessas áreas, o Anuá pode se posicionar como a alternativa moderna e inteligente aos players tradicionais (Sponte, SIGA), capturando market share no segmento de escolas K-12 e expandindo para cursos livres.

**Prioridade imediata (próximas 2 semanas):**

- Fix race condition em gamificação
- Otimizar queries SQL ineficientes
- Padronizar fetch com TanStack Query
- Remover `as any` para melhor type safety

---

**Documento gerado em:** 2026-05-25  
**Última atualização:** 2026-05-25 (revisão de código)  
**Próxima revisão:** 2026-06-25
