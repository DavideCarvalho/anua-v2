# Design: Sistema de Gamificação do anua-v2

**Data**: 2026-02-25  
**Origem**: school-super-app  
**Status**: Aprovado

---

## Resumo Executivo

Migração do sistema completo de gamificação do school-super-app para o anua-v2, adaptado para o contexto de educação escolar (ensino fundamental/médio) com integração com a cantina existente.

---

## Contexto

### Origem (school-super-app)

O school-super-app possui um sistema robusto de gamificação com:

- Sistema de XP/pontos com níveis
- Conquistas (achievements/badges) com categorias e raridades
- Desafios (challenges) com prazo e progresso
- Loja de recompensas integrada com cantina
- Rankings (leaderboards) periódicos
- Streaks de atividade
- Processamento assíncrono de eventos via jobs

### Destino (anua-v2)

Projeto AdonisJS/InertiaJS com:

- PostgreSQL + Lucid ORM (migrations)
- BullMQ para filas/jobs
- Estrutura de cantina já existente (`canteen_items`, etc.)
- Tabelas básicas de gamificação já existentes (`student_gamification`, `point_transaction`)

---

## Arquitetura

### Padrão: Event-Driven Async Processing

```
Ação do Aluno → Cria GamificationEvent → Enfileira Job → Processa → Atualiza Dados
```

**Vantagens**:

- Desacoplamento entre ações e regras de gamificação
- Processamento em background não bloqueia resposta da API
- Facilidade para adicionar novos tipos de eventos
- Histórico completo de eventos para debug/auditoria

### Componentes Principais

1. **Event Service**: Cria eventos de gamificação
2. **Job Processor**: Processa eventos e avalia conquistas
3. **Criteria Evaluator**: Verifica se critérios de conquistas foram atendidos
4. **Points Service**: Calcula e atualiza pontos/níveis/streaks
5. **Store Service**: Gerencia loja e pedidos
6. **Leaderboard Service**: Calcula e atualiza rankings

---

## Schema do Banco de Dados

### Tabelas Existentes (Expandidas)

Tabelas já existentes no anua-v2 que serão expandidas:

- `student_gamification` - Adicionar campos para streak
- `point_transaction` - Já existe, manter
- `gamification_event` - Já existe, expandir campos

### Novas Tabelas

#### 1. Achievements (Conquistas)

```typescript
Table: achievements
- id: string (uuid)
- slug: string (unique)
- name: string
- description: text
- icon: string? (URL ou emoji)
- points: integer (default: 0)
- category: AchievementCategory (enum)
- criteria: jsonb (critérios para desbloquear)
- is_secret: boolean (default: false)
- rarity: AchievementRarity (enum)
- max_unlocks: integer? (null = ilimitado)
- recurrence_period: RecurrencePeriod? (enum, null = única)
- school_id: string? (FK, null = global)
- school_chain_id: string? (FK, null = não é de rede)
- is_active: boolean (default: true)
- deleted_at: timestamp? (soft delete)
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [slug, school_id] unique
- [school_id]
- [school_chain_id]
- [deleted_at]
```

#### 2. Student Achievements (Conquistas Desbloqueadas)

```typescript
Table: student_achievements
- id: string (uuid)
- student_gamification_id: string (FK)
- achievement_id: string (FK)
- unlocked_at: timestamp
- progress: integer (default: 100, para conquistas progressivas)

Indexes:
- [student_gamification_id, achievement_id] unique
- [student_gamification_id]
- [achievement_id]
```

#### 3. Challenges (Desafios)

```typescript
Table: challenges
- id: string (uuid)
- name: string
- description: text
- icon: string?
- points: integer (default: 0)
- category: ChallengeCategory (enum)
- criteria: jsonb
- is_recurring: boolean (default: false)
- recurrence_period: RecurrencePeriod? (enum)
- start_date: date?
- end_date: date?
- school_id: string? (FK)
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [school_id]
```

#### 4. Student Challenges (Progresso em Desafios)

```typescript
Table: student_challenges
- id: string (uuid)
- student_gamification_id: string (FK)
- challenge_id: string (FK)
- progress: integer (0-100)
- is_completed: boolean (default: false)
- completed_at: timestamp?
- started_at: timestamp (default: now)

Indexes:
- [student_gamification_id, challenge_id] unique
- [student_gamification_id]
- [challenge_id]
```

#### 5. Store Items (Itens da Loja)

```typescript
Table: store_items
- id: string (uuid)
- name: string
- description: text
- price: integer (centavos)
- payment_mode: PaymentMode (enum)
- points_to_money_rate: integer (default: 100)
- min_points_percentage: integer? (para HYBRID)
- max_points_percentage: integer? (para HYBRID)
- category: StoreCategory (enum)
- image_url: string?
- total_stock: integer? (null = ilimitado)
- reserved_stock: integer (default: 0)
- max_per_student: integer?
- max_per_student_period: RecurrencePeriod?
- preparation_time_minutes: integer?
- requires_approval: boolean (default: true)
- pickup_location: string?
- is_active: boolean (default: true)
- school_id: string (FK)
- canteen_item_id: string? (FK, unique)
- available_from: date?
- available_until: date?
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [school_id]
- [category]
- [canteen_item_id]
```

#### 6. Store Orders (Pedidos)

```typescript
Table: store_orders
- id: string (uuid)
- order_number: string (unique)
- student_id: string (FK)
- school_id: string (FK)
- status: OrderStatus (enum)
- total_price: integer (centavos)
- total_points: integer
- total_money: integer (centavos)
- created_at: timestamp
- paid_at: timestamp?
- approved_at: timestamp?
- preparing_at: timestamp?
- ready_at: timestamp?
- delivered_at: timestamp?
- canceled_at: timestamp?
- estimated_ready_at: timestamp?
- student_notes: text?
- internal_notes: text?
- cancellation_reason: text?
- approved_by: string? (FK - user)
- prepared_by: string? (FK - user)
- delivered_by: string? (FK - user)
- updated_at: timestamp

Indexes:
- [student_id]
- [school_id]
- [status]
- [created_at]
```

#### 7. Store Order Items

```typescript
Table: store_order_items
- id: string (uuid)
- order_id: string (FK)
- store_item_id: string (FK)
- quantity: integer
- unit_price: integer (centavos)
- payment_mode: PaymentMode
- points_to_money_rate: integer
- points_paid: integer
- money_paid: integer (centavos)
- item_name: string
- item_description: text?
- item_image_url: string?
- created_at: timestamp

Indexes:
- [order_id]
```

#### 8. Order Status History

```typescript
Table: order_status_history
- id: string (uuid)
- order_id: string (FK)
- from_status: OrderStatus?
- to_status: OrderStatus
- changed_by: string? (FK - user)
- notes: text?
- created_at: timestamp

Indexes:
- [order_id]
```

#### 9. Leaderboards (Rankings)

```typescript
Table: leaderboards
- id: string (uuid)
- name: string
- type: LeaderboardType (enum)
- period: RecurrencePeriod (enum)
- start_date: date
- end_date: date
- school_id: string? (FK)
- class_id: string? (FK)
- subject_id: string? (FK)
- is_active: boolean (default: true)
- created_at: timestamp

Indexes:
- [school_id]
- [class_id]
- [subject_id]
```

#### 10. Leaderboard Entries

```typescript
Table: leaderboard_entries
- id: string (uuid)
- leaderboard_id: string (FK)
- student_id: string (FK)
- score: integer
- rank: integer
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [leaderboard_id, student_id] unique
- [leaderboard_id, rank]
```

#### 11. School Achievement Configs

```typescript
Table: school_achievement_configs
- id: string (uuid)
- school_id: string (FK)
- achievement_id: string (FK)
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [school_id, achievement_id] unique
- [school_id]
- [achievement_id]
```

#### 12. School Chain Achievement Configs

```typescript
Table: school_chain_achievement_configs
- id: string (uuid)
- school_chain_id: string (FK)
- achievement_id: string (FK)
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [school_chain_id, achievement_id] unique
- [school_chain_id]
- [achievement_id]
```

#### 13. School Gamification Settings

```typescript
Table: school_gamification_settings
- id: string (uuid)
- school_id: string (FK, unique)
- points_to_money_rate: integer (default: 100)
- created_at: timestamp
- updated_at: timestamp

Indexes:
- [school_id]
```

### Enums

```typescript
enum RecurrencePeriod {
  DAILY
  WEEKLY
  MONTHLY
  SEMESTER
  ANNUAL
}

enum TransactionType {
  EARNED      // Ganhou pontos
  SPENT       // Gastou na loja
  ADJUSTED    // Ajuste manual (admin)
  PENALTY     // Penalidade
  BONUS       // Bônus especial
  REFUND      // Reembolso
}

enum AchievementCategory {
  ACADEMIC
  ATTENDANCE
  BEHAVIOR
  SOCIAL
  SPECIAL
}

enum AchievementRarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
}

enum ChallengeCategory {
  ACADEMIC
  ATTENDANCE
  BEHAVIOR
  PARTICIPATION
  SOCIAL
  SPECIAL
}

enum PaymentMode {
  POINTS_ONLY  // Apenas pontos
  MONEY_ONLY   // Apenas dinheiro
  HYBRID       // Pontos + dinheiro
}

enum StoreCategory {
  CANTEEN_FOOD
  CANTEEN_DRINK
  SCHOOL_SUPPLY
  PRIVILEGE
  HOMEWORK_PASS
  UNIFORM
  BOOK
  MERCHANDISE
  DIGITAL
  OTHER
}

enum OrderStatus {
  PENDING_PAYMENT
  PENDING_APPROVAL
  APPROVED
  PREPARING
  READY
  DELIVERED
  CANCELED
  REJECTED
}

enum LeaderboardType {
  POINTS
  ATTENDANCE
  GRADES
  PARTICIPATION
}
```

---

## APIs e Endpoints

### Endpoints para Alunos

```typescript
// Perfil de gamificação do aluno
GET /api/gamification/student/:id
Response: {
  id: string
  total_points: number
  current_level: number
  level_progress: number
  streak: number
  longest_streak: number
  last_activity_at: string?
  achievements_count: number
  challenges_completed: number
}

// Conquistas do aluno
GET /api/gamification/student/:id/achievements
Query: { page?: number, size?: number }
Response: {
  data: Array<{
    id: string
    achievement: {
      name: string
      description: string
      icon: string?
      points: number
      category: AchievementCategory
      rarity: AchievementRarity
    }
    unlocked_at: string
    progress: number
  }>
  pagination: PaginationInfo
}

// Desafios do aluno
GET /api/gamification/student/:id/challenges
Query: { status?: 'active' | 'completed' | 'all', page?: number, size?: number }
Response: {
  data: Array<{
    id: string
    challenge: {
      name: string
      description: string
      icon: string?
      points: number
      end_date: string?
    }
    progress: number
    is_completed: boolean
    completed_at: string?
    started_at: string
  }>
  pagination: PaginationInfo
}

// Histórico de transações de pontos
GET /api/gamification/student/:id/transactions
Query: { type?: TransactionType, page?: number, size?: number }
Response: {
  data: Array<{
    id: string
    points: number
    balance_after: number
    type: TransactionType
    reason: string?
    related_entity_type: string?
    related_entity_id: string?
    created_at: string
  }>
  pagination: PaginationInfo
}

// Ranking da escola/turma
GET /api/gamification/ranking
Query: {
  school_id?: string
  class_id?: string
  academic_period_id?: string
  search?: string
  page?: number
  size?: number
}
Response: {
  data: Array<{
    rank: number
    student_id: string
    score: number
    student: {
      id: string
      name: string
      image_url: string?
      class: {
        id: string
        name: string
        school: {
          id: string
          name: string
        }
      }?
    }
  }>
  pagination: PaginationInfo
}
```

### Endpoints para Admin/Escola

```typescript
// Adicionar/remover pontos manualmente
POST /api/gamification/points
Body: {
  student_gamification_id: string
  points: number (positivo ou negativo)
  reason: string
  type: TransactionType
  related_entity_type?: string
  related_entity_id?: string
}

// Criar conquista
POST /api/gamification/achievements
Body: {
  name: string
  description: string
  icon?: string
  points: number
  category: AchievementCategory
  criteria: object
  is_secret?: boolean
  rarity?: AchievementRarity
  max_unlocks?: number
  recurrence_period?: RecurrencePeriod
  school_id?: string
}

// Atualizar conquista
PUT /api/gamification/achievements/:id
Body: Partial<AchievementInput>

// Listar conquistas
GET /api/gamification/achievements
Query: { school_id?: string, is_active?: boolean, page?: number, size?: number }

// Criar desafio
POST /api/gamification/challenges
Body: {
  name: string
  description: string
  icon?: string
  points: number
  category: ChallengeCategory
  criteria: object
  is_recurring?: boolean
  recurrence_period?: RecurrencePeriod
  start_date?: string
  end_date?: string
  school_id?: string
}

// Atualizar desafio
PUT /api/gamification/challenges/:id
Body: Partial<ChallengeInput>

// Listar desafios
GET /api/gamification/challenges
Query: { school_id?: string, is_active?: boolean, page?: number, size?: number }

// Distribuição de pontos por escola (analytics)
GET /api/gamification/analytics/points-distribution
Query: { school_id?: string, school_chain_id?: string }
Response: Array<{
  school_id: string
  school_name: string
  total_points: number
  students_count: number
  average_points: number
}>

// Configurações de gamificação da escola
GET /api/gamification/settings/:school_id
PUT /api/gamification/settings/:school_id
Body: { points_to_money_rate: number }
```

### Endpoints da Loja

```typescript
// Listar itens da loja
GET /api/store/items
Query: {
  school_id: string
  category?: StoreCategory
  available?: boolean
  page?: number
  size?: number
}
Response: {
  data: Array<{
    id: string
    name: string
    description: string
    price: number
    payment_mode: PaymentMode
    points_to_money_rate: number
    category: StoreCategory
    image_url: string?
    total_stock: number?
    available_from: string?
    available_until: string?
    is_active: boolean
  }>
  pagination: PaginationInfo
}

// Criar pedido
POST /api/store/orders
Body: {
  student_id: string
  school_id: string
  items: Array<{
    store_item_id: string
    quantity: number
    points_paid?: number
    money_paid?: number
  }>
  student_notes?: string
}

// Obter pedido
GET /api/store/orders/:id
Response: {
  id: string
  order_number: string
  status: OrderStatus
  total_price: number
  total_points: number
  total_money: number
  items: Array<{
    id: string
    quantity: number
    unit_price: number
    item_name: string
    points_paid: number
    money_paid: number
  }>
  status_history: Array<{
    from_status: OrderStatus?
    to_status: OrderStatus
    changed_by: string?
    notes: string?
    created_at: string
  }>
  // ... outros campos
}

// Listar pedidos do aluno
GET /api/store/orders
Query: { student_id: string, status?: OrderStatus, page?: number, size?: number }

// Atualizar status do pedido (admin)
PUT /api/store/orders/:id/status
Body: {
  status: OrderStatus
  notes?: string
}

// Criar item da loja (admin)
POST /api/store/items
Body: {
  name: string
  description: string
  price: number
  payment_mode: PaymentMode
  category: StoreCategory
  image_url?: string
  total_stock?: number
  school_id: string
  canteen_item_id?: string
  // ... outros campos
}
```

---

## Componentes de UI (Inertia/React)

### Para Alunos

#### 1. GamificationProfile

- **Props**: `studentId: string`
- **Funcionalidade**: Mostra pontos totais, nível atual, progresso para próximo nível, streak atual
- **Layout**: Card com avatar, barra de progresso circular/linear, badges de streak

#### 2. AchievementsGrid

- **Props**: `studentId: string, filters?: object`
- **Funcionalidade**: Grid de conquistas com ícones, mostra bloqueadas (cinza/opacas) e desbloqueadas (coloridas)
- **Layout**: Grid responsivo com cards de conquista

#### 3. ChallengesList

- **Props**: `studentId: string`
- **Funcionalidade**: Lista de desafios ativos com barras de progresso, prazos
- **Layout**: Lista vertical com cards expansíveis

#### 4. LeaderboardTable

- **Props**: `schoolId?: string, classId?: string`
- **Funcionalidade**: Tabela paginada de rankings, destaque para o aluno logado
- **Layout**: Tabela com posição, avatar, nome, pontos

#### 5. StoreCatalog

- **Props**: `schoolId: string`
- **Funcionalidade**: Catálogo de itens com filtros por categoria, carrinho de compras
- **Layout**: Grid de produtos com modal de detalhes

#### 6. OrderHistory

- **Props**: `studentId: string`
- **Funcionalidade**: Histórico de pedidos com status (timeline)
- **Layout**: Lista vertical com timeline de status

### Para Admin

#### 1. PointsAdjustmentModal

- **Props**: `studentId: string, isOpen: boolean, onClose: () => void`
- **Funcionalidade**: Modal para adicionar/remover pontos com justificativa
- **Layout**: Formulário com input de pontos (positivo/negativo), textarea de motivo

#### 2. AchievementEditor

- **Props**: `achievementId?: string (modo edição)`
- **Funcionalidade**: Formulário completo para criar/editar conquistas com editor de critérios JSON
- **Layout**: Form multi-step ou abas (info básica, critérios, configurações)

#### 3. ChallengeCreator

- **Props**: `challengeId?: string`
- **Funcionalidade**: Similar ao AchievementEditor mas para desafios com datas de início/fim
- **Layout**: Form com date pickers, recorrência

#### 4. StoreManager

- **Props**: `schoolId: string`
- **Funcionalidade**: CRUD de itens da loja, gestão de estoque, integração com cantina
- **Layout**: Tabela de itens com ações de editar/desativar, modal de criação

#### 5. OrderManagement

- **Props**: `schoolId: string`
- **Funcionalidade**: Dashboard de pedidos pendentes, aprovação, mudança de status
- **Layout**: Kanban ou tabela com filtros por status

#### 6. GamificationAnalytics

- **Props**: `schoolId?: string, schoolChainId?: string`
- **Funcionalidade**: Dashboard com gráficos de distribuição de pontos, conquistas mais populares
- **Layout**: Grid de cards com gráficos (barras, pizza, linha do tempo)

---

## Regras de Negócio

### Sistema de Pontos e Níveis

- **Pontos por nível**: 1000 pontos
- **Cálculo de nível**: `Math.floor(totalPoints / 1000) + 1`
- **Progresso no nível**: `totalPoints % 1000`
- **Streak**:
  - Incrementa se última atividade foi ontem
  - Mantém se última atividade foi hoje
  - Reseta para 1 se última atividade foi antes de ontem
  - `longestStreak` sempre armazena o máximo atingido

### Conquistas

- **Desbloqueio**: Processado via job quando evento corresponde aos critérios
- **Critérios**: Objeto JSON flexível (ex: `{ type: 'ATTENDANCE', count: 10 }`)
- **Secretas**: `isSecret = true` não aparece na lista até ser desbloqueada
- **Raridades**: COMMON, RARE, EPIC, LEGENDARY (afeta visual e pontos)
- **Recorrência**: Se definida, reseta a cada período (ex: semanal)
- **Limites**: `maxUnlocks` limita quantos alunos podem desbloquear

### Desafios

- **Progresso**: Atualizado em tempo real conforme eventos ocorrem
- **Prazo**: `startDate` e `endDate` definem período de disponibilidade
- **Recorrentes**: Quando completado e `isRecurring = true`, reseta no próximo período
- **Critérios**: Mesma estrutura de conquistas

### Loja

- **Modos de pagamento**:
  - POINTS_ONLY: Apenas pontos (ex: passe de tarefa)
  - MONEY_ONLY: Apenas dinheiro (ex: uniforme oficial)
  - HYBRID: Combinação com limites de % (ex: lanche)
- **Taxa de conversão**: Configurável por escola (padrão: 100 pontos = R$ 1,00)
- **Estoque**: `totalStock - reservedStock = disponível`
- **Limites por aluno**: `maxPerStudent` com período (ex: 1 por semana)
- **Integração cantina**: Items podem referenciar `canteen_item_id`

### Rankings

- **Tipos**: POINTS, ATTENDANCE, GRADES, PARTICIPATION
- **Períodos**: Diário, semanal, mensal, semestral, anual
- **Escopo**: Global, por escola, por turma, por matéria
- **Atualização**: Job periódico recalcula rankings

### Eventos de Gamificação

Tipos de eventos que disparam processamento:

- `ASSIGNMENT_COMPLETED` - Tarefa completada
- `ATTENDANCE_MARKED` - Presença marcada
- `ATTENDANCE_PRESENT` - Presença (status específico)
- `ATTENDANCE_LATE` - Atraso
- `GRADE_RECEIVED` - Nota recebida
- `GRADE_EXCELLENT` - Nota excelente (>= 90%)
- `GRADE_GOOD` - Nota boa (>= 70%)
- `STORE_PURCHASE` - Compra na loja
- `POINTS_MANUAL_ADD` - Adição manual de pontos
- `POINTS_MANUAL_REMOVE` - Remoção manual de pontos

### Permissões

- **Aluno**: Ver próprio perfil, conquistas, desafios, ranking, loja, histórico
- **Responsável**: Ver perfil dos filhos, histórico, compras
- **Professor**: Ver rankings da turma, ajustar pontos (se permitido)
- **Coordenador**: CRUD conquistas/desafios, ajustar pontos, ver analytics
- **Admin escola**: Configurar taxas de conversão, gerenciar itens da loja
- **Admin rede**: Criar conquistas globais, ver analytics de toda a rede

---

## Integrações

### Com Sistema de Cantina Existente

- **StoreItem.canteen_item_id**: FK opcional para items da cantina
- **Fluxo de compra**: Pedido na loja pode gerar `canteen_purchase`
- **Preços**: Podem ser sincronizados entre cantina e loja
- **Estoque**: Compartilhado se `canteen_item_id` estiver definido

### Com Sistema de Notificações

- Novas conquistas: Notificação push/email
- Pedidos aprovados/prontos: Notificação para aluno
- Mudanças de status: Notificação em tempo real
- Novos desafios disponíveis: Notificação periódica

### Com Sistema de Presença/Notas

- Eventos automáticos quando presença é marcada
- Eventos automáticos quando notas são lançadas
- Integração com calendário escolar para streaks

---

## Jobs e Processamento Assíncrono

### Jobs Principais

1. **ProcessGamificationEventJob**
   - Processa eventos de gamificação
   - Avalia conquistas e desafios
   - Atualiza pontos e níveis
   - Executa: Quando evento é criado

2. **UpdateStreaksJob**
   - Atualiza streaks diariamente
   - Reseta streaks de alunos inativos
   - Executa: Diariamente à meia-noite

3. **RetryPendingEventsJob**
   - Reprocessa eventos com erro
   - Executa: A cada hora

4. **UpdateLeaderboardsJob**
   - Recalcula rankings periódicos
   - Executa: Conforme periodicidade (diário/semanal/etc)

5. **ExpireChallengesJob**
   - Finaliza desafios expirados
   - Executa: Diariamente

### Fila

- Nome: `gamification`
- Prioridade: Normal
- Retry: 3 tentativas com backoff exponencial
- Dead letter: Eventos com erro são salvos para análise manual

---

## Considerações de Performance

### Otimizações

- **Índices**: Todos os campos de filtro e FK indexados
- **Cache**: Redis para rankings (TTL: 5 minutos)
- **Paginação**: Todos os endpoints de lista paginados
- **Lazy loading**: Conquistas secretas só carregam quando desbloqueadas
- **Batch processing**: Jobs processam eventos em batch quando possível

### Escalabilidade

- **Sharding**: Por escola para rankings muito grandes
- **Materialized views**: Para rankings complexos
- **CDN**: Imagens dos itens da loja

---

## Segurança

### Validações

- Aluno só pode ver próprios dados
- Responsável só pode ver dados dos filhos vinculados
- Ajustes manuais de pontos requerem permissão específica
- Critérios de conquistas validados contra injeção
- Valores de pontos validados (não negativos em transações indevidas)

### Proteções

- Rate limiting em endpoints de ajuste de pontos
- Audit trail em todas as transações de pontos
- Soft delete em conquistas (não perde histórico)
- Validação de estoque antes de confirmar pedido

---

## Decisões de Design

### Por que não usar triggers de banco?

- Lógica de negócio complexa nos critérios
- Necessidade de processamento assíncrono
- Flexibilidade para mudar regras sem migrações
- Melhor testabilidade em código

### Por que separar Eventos do Processamento?

- Desacoplamento permite evoluir regras independentemente
- Facilita debug (histórico de eventos)
- Permite reprocessamento em caso de falha
- Suporta batch processing para alta carga

### Por que manter histórico de transações?

- Audit trail completo
- Permite análise de comportamento
- Suporta reversão de operações
- Transparência para alunos e responsáveis

---

## Referências

- school-super-app: `/packages/db/prisma/models/gamification.prisma`
- school-super-app: `/packages/job-registry/src/jobs/gamification/`
- school-super-app: `/packages/api/src/router/gamification/`
- school-super-app: `/apps/anua/src/app/responsavel/gamificacao/`
- anua-v2: `/database/migrations/*gamification*`
- anua-v2: `/database/migrations/*point*`
- anua-v2: `/database/migrations/*store*`
- anua-v2: `/database/migrations/*canteen*`
