# Gamification System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar o sistema completo de gamificação no anua-v2, migrando do school-super-app.

**Architecture:** Event-driven com processamento assíncrono via jobs. Eventos → Fila → Job processa → Atualiza dados.

**Tech Stack:** AdonisJS 6, Lucid ORM, PostgreSQL, BullMQ, InertiaJS + React

**Design Doc:** `docs/plans/2026-02-25-gamification-system-design.md`

---

## Fase 1: Database (Migrations)

### Task 1.1: Criar enums

**Arquivo:** `database/migrations/1779000000000_create_gamification_enums.ts`

- TransactionType, AchievementCategory, AchievementRarity
- ChallengeCategory, PaymentMode, StoreCategory
- OrderStatus, LeaderboardType, RecurrencePeriod
  **Commit:** "feat(gamification): add enums migration"

### Task 1.2: Criar tabelas de conquistas

**Arquivos:**

- `database/migrations/1779000001000_create_achievements_table.ts`
- `database/migrations/1779000002000_create_student_achievements_table.ts`
  **Commit:** "feat(gamification): add achievements tables"

### Task 1.3: Criar tabelas de desafios

**Arquivo:** `database/migrations/1779000003000_create_challenges_tables.ts`

- challenges, student_challenges
  **Commit:** "feat(gamification): add challenges tables"

### Task 1.4: Criar tabelas da loja

**Arquivo:** `database/migrations/1779000004000_create_store_tables.ts`

- store_items, store_orders, store_order_items, order_status_history
  **Commit:** "feat(gamification): add store tables"

### Task 1.5: Criar tabelas de ranking

**Arquivo:** `database/migrations/1779000005000_create_leaderboard_tables.ts`

- leaderboards, leaderboard_entries
  **Commit:** "feat(gamification): add leaderboard tables"

### Task 1.6: Criar tabelas de configuração

**Arquivo:** `database/migrations/1779000006000_create_gamification_config_tables.ts`

- school_gamification_settings, school_achievement_configs
  **Commit:** "feat(gamification): add config tables"

---

## Fase 2: Models

### Task 2.1: Achievement models

**Arquivos:**

- `app/models/gamification/achievement.ts`
- `app/models/gamification/student_achievement.ts`
  **Commit:** "feat(gamification): add Achievement models"

### Task 2.2: Challenge models

**Arquivos:**

- `app/models/gamification/challenge.ts`
- `app/models/gamification/student_challenge.ts`
  **Commit:** "feat(gamification): add Challenge models"

### Task 2.3: Store models

**Arquivos:**

- `app/models/gamification/store_item.ts`
- `app/models/gamification/store_order.ts`
- `app/models/gamification/store_order_item.ts`
- `app/models/gamification/order_status_history.ts`
  **Commit:** "feat(gamification): add Store models"

### Task 2.4: Leaderboard models

**Arquivos:**

- `app/models/gamification/leaderboard.ts`
- `app/models/gamification/leaderboard_entry.ts`
- `app/models/gamification/school_gamification_settings.ts`
  **Commit:** "feat(gamification): add Leaderboard models"

---

## Fase 3: Services

### Task 3.1: GamificationEventService

**Arquivo:** `app/services/gamification/gamification_event_service.ts`

- Criar eventos, helpers (emitAssignmentCompleted, emitAttendanceMarked, etc.)
  **Test:** `tests/unit/services/gamification_event_service.spec.ts`
  **Commit:** "feat(gamification): add GamificationEventService"

### Task 3.2: PointsService

**Arquivo:** `app/services/gamification/points_service.ts`

- calculateLevel, calculateStreak, addPoints
  **Test:** `tests/unit/services/points_service.spec.ts`
  **Commit:** "feat(gamification): add PointsService"

### Task 3.3: CriteriaEvaluator

**Arquivo:** `app/services/gamification/criteria_evaluator.ts`

- evaluate, matchesEventType
  **Test:** `tests/unit/services/criteria_evaluator.spec.ts`
  **Commit:** "feat(gamification): add CriteriaEvaluator"

---

## Fase 4: Jobs

### Task 4.1: ProcessGamificationEventJob

**Arquivo:** `app/jobs/gamification/process_gamification_event_job.ts`

- Processa eventos, desbloqueia conquistas, atualiza desafios
  **Test:** `tests/unit/jobs/process_gamification_event_job.spec.ts`
  **Commit:** "feat(gamification): add ProcessGamificationEventJob"

### Task 4.2: Jobs agendados

**Arquivos:**

- `app/jobs/gamification/update_streaks_job.ts`
- `app/jobs/gamification/retry_pending_events_job.ts`
- `commands/gamification/update_streaks.ts`
- `commands/gamification/retry_events.ts`
- `start/scheduler.ts`
  **Commit:** "feat(gamification): add scheduled jobs"

---

## Fase 5: Controllers e Rotas

### Task 5.1: GamificationController

**Arquivos:**

- `app/controllers/gamification/gamification_controller.ts`
- `app/validators/gamification/add_points.ts`
  **Commit:** "feat(gamification): add GamificationController"

### Task 5.2: RankingController

**Arquivos:**

- `app/controllers/gamification/ranking_controller.ts`
- `app/validators/gamification/ranking.ts`
  **Commit:** "feat(gamification): add RankingController"

### Task 5.3: StoreController

**Arquivos:**

- `app/controllers/gamification/store_controller.ts`
- `app/validators/gamification/store.ts`
  **Commit:** "feat(gamification): add StoreController"

### Task 5.4: Rotas

**Arquivo:** `start/routes.ts`

- Adicionar todas as rotas de gamificação
  **Commit:** "feat(gamification): register API routes"

---

## Fase 6: UI Components

### Task 6.1: GamificationProfile

**Arquivo:** `inertia/components/gamification/profile.tsx`
**Commit:** "feat(gamification): add Profile component"

### Task 6.2: AchievementsGrid

**Arquivo:** `inertia/components/gamification/achievements-grid.tsx`
**Commit:** "feat(gamification): add AchievementsGrid component"

### Task 6.3: LeaderboardTable

**Arquivo:** `inertia/components/gamification/leaderboard-table.tsx`
**Commit:** "feat(gamification): add LeaderboardTable component"

### Task 6.4: Store Components

**Arquivos:**

- `inertia/components/gamification/store-catalog.tsx`
- `inertia/components/gamification/order-history.tsx`
  **Commit:** "feat(gamification): add Store components"

---

## Fase 7: Páginas Inertia

### Task 7.1: Página de Gamificação do Aluno

**Arquivo:** `inertia/pages/student/gamification/index.tsx`
**Commit:** "feat(gamification): add student gamification page"

### Task 7.2: Página de Ranking

**Arquivo:** `inertia/pages/student/gamification/ranking.tsx`
**Commit:** "feat(gamification): add ranking page"

### Task 7.3: Página da Loja

**Arquivo:** `inertia/pages/student/store/index.tsx`
**Commit:** "feat(gamification): add store page"

### Task 7.4: Páginas Admin

**Arquivos:**

- `inertia/pages/admin/gamification/achievements.tsx`
- `inertia/pages/admin/gamification/challenges.tsx`
- `inertia/pages/admin/store/items.tsx`
- `inertia/pages/admin/store/orders.tsx`
  **Commit:** "feat(gamification): add admin pages"

---

## Fase 8: Testes e Configuração

### Task 8.1: Testes de Integração

**Arquivo:** `tests/integration/gamification_flow.spec.ts`
**Commit:** "test(gamification): add integration tests"

### Task 8.2: Seeder

**Arquivo:** `database/seeders/gamification_seeder.ts`
**Commit:** "feat(gamification): add seeder"

### Task 8.3: Configuração de Fila

**Arquivos:**

- `start/jobs.ts`
- `providers/queue_provider.ts` (se necessário)
- Atualizar `adonisrc.ts`
  **Commit:** "feat(gamification): configure queue"

---

## Estrutura de Diretórios

```
app/
├── controllers/gamification/
│   ├── gamification_controller.ts
│   ├── ranking_controller.ts
│   └── store_controller.ts
├── jobs/gamification/
│   ├── process_gamification_event_job.ts
│   ├── update_streaks_job.ts
│   └── retry_pending_events_job.ts
├── models/gamification/
│   ├── achievement.ts
│   ├── student_achievement.ts
│   ├── challenge.ts
│   ├── student_challenge.ts
│   ├── store_item.ts
│   ├── store_order.ts
│   ├── store_order_item.ts
│   ├── order_status_history.ts
│   ├── leaderboard.ts
│   ├── leaderboard_entry.ts
│   └── school_gamification_settings.ts
├── services/gamification/
│   ├── gamification_event_service.ts
│   ├── points_service.ts
│   └── criteria_evaluator.ts
└── validators/gamification/
    ├── add_points.ts
    ├── ranking.ts
    └── store.ts

inertia/components/gamification/
├── profile.tsx
├── achievements-grid.tsx
├── challenges-list.tsx
├── leaderboard-table.tsx
├── store-catalog.tsx
└── order-history.tsx

inertia/pages/student/gamification/
├── index.tsx
└── ranking.tsx

inertia/pages/student/store/
└── index.tsx

inertia/pages/admin/gamification/
├── achievements.tsx
├── challenges.tsx
└── analytics.tsx

inertia/pages/admin/store/
├── items.tsx
└── orders.tsx

database/migrations/
├── 1779000000000_create_gamification_enums.ts
├── 1779000001000_create_achievements_table.ts
├── 1779000002000_create_student_achievements_table.ts
├── 1779000003000_create_challenges_tables.ts
├── 1779000004000_create_store_tables.ts
├── 1779000005000_create_leaderboard_tables.ts
└── 1779000006000_create_gamification_config_tables.ts
```

---

## Checklist de Implementação

- [ ] Fase 1: Database migrations criadas e rodadas
- [ ] Fase 2: Models criados com relações
- [ ] Fase 3: Services implementados com testes
- [ ] Fase 4: Jobs configurados e funcionando
- [ ] Fase 5: Controllers e rotas registrados
- [ ] Fase 6: UI components básicos
- [ ] Fase 7: Páginas Inertia criadas
- [ ] Fase 8: Testes de integração passando
- [ ] Documentação API atualizada
- [ ] Seeder funcional

## Próximos Passos

Após implementação, executar:

1. `node ace migration:run` - Rodar migrations
2. `node ace db:seed --files=gamification_seeder` - Popular dados
3. `node ace queue:listen` - Iniciar worker de fila
4. Testar endpoints via Postman/Insomnia

---

**Total estimado:** 28 tasks  
**Tempo estimado:** 3-4 dias de trabalho  
**Dependências:** BullMQ, Redis, PostgreSQL
