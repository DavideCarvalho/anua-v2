# Comunicados com Anexos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir anexar multiplos arquivos (ate 5) em comunicados e exibir esses anexos para responsaveis.

**Architecture:** Criar tabela/model de anexos vinculados ao comunicado, endpoint dedicado para upload com validacao server-side e sincronizacao de anexos nos endpoints de criar/editar comunicado. Frontend da escola envia uploads assincronos e salva vinculos; frontend do responsavel apenas lista/abre anexos via transformer.

**Tech Stack:** AdonisJS (controllers, validators, Lucid, migrations, transformers), React + Inertia, TanStack Query, Sonner toast, Japa (functional/browser tests).

---

### Task 1: Persistencia de anexos do comunicado

**Files:**

- Create: `database/migrations/1779000003000_create_school_announcement_attachments_table.ts`
- Create: `app/models/school_announcement_attachment.ts`
- Modify: `app/models/school_announcement.ts`

**Step 1: Write the failing test**

Adicionar teste funcional em `tests/functional/escola/school_announcements_api.spec.ts` que cria comunicado com anexos (injetados no banco inicialmente) e espera retorno com `attachments`.

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/escola/school_announcements_api.spec.ts --match "attachments"`
Expected: FAIL por falta de relacao/model/tabela.

**Step 3: Write minimal implementation**

- Criar migration com colunas:
  - `id` uuid
  - `announcementId` FK
  - `fileName`, `mimeType`, `fileSizeBytes`, `filePath`, `publicUrl` (ou campo equivalente usado no projeto)
  - `position` (ordem)
  - `createdAt`, `updatedAt`
- Criar model `SchoolAnnouncementAttachment`.
- Adicionar `hasMany` em `SchoolAnnouncement`.

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS no teste novo.

**Step 5: Commit**

```bash
git add database/migrations/1779000003000_create_school_announcement_attachments_table.ts app/models/school_announcement_attachment.ts app/models/school_announcement.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): add announcement attachments persistence"
```

### Task 2: Transformer + leitura de anexos

**Files:**

- Create: `app/transformers/school_announcement_attachment_transformer.ts`
- Modify: `app/transformers/school_announcement_transformer.ts`
- Modify: `app/controllers/school_announcements/list_school_announcements_controller.ts`
- Modify: `app/controllers/school_announcements/show_school_announcement_controller.ts`
- Modify: `app/controllers/responsavel/list_comunicados_controller.ts`
- Modify: `app/controllers/responsavel/show_comunicado_controller.ts`

**Step 1: Write the failing test**

Adicionar assercoes no teste funcional para garantir que `attachments` aparece no payload de escola e responsavel.

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/escola/school_announcements_api.spec.ts --match "returns attachments"`
Expected: FAIL sem campo `attachments`.

**Step 3: Write minimal implementation**

- Criar transformer de anexo.
- Preload de `attachments` nos controllers de list/show de escola e responsavel.
- Incluir `attachments` no transformer principal.

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS.

**Step 5: Commit**

```bash
git add app/transformers/school_announcement_attachment_transformer.ts app/transformers/school_announcement_transformer.ts app/controllers/school_announcements/list_school_announcements_controller.ts app/controllers/school_announcements/show_school_announcement_controller.ts app/controllers/responsavel/list_comunicados_controller.ts app/controllers/responsavel/show_comunicado_controller.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): expose attachments in announcement responses"
```

### Task 3: Endpoint de upload de anexos

**Files:**

- Create: `app/controllers/school_announcements/upload_school_announcement_attachment_controller.ts`
- Modify: `start/routes/api/school_announcements.ts`
- Modify: `app/lib/file_security.ts` (se necessario para tipos permitidos)
- Create/Modify: validator dedicado em `app/validators/school_announcement.ts` ou novo arquivo
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar testes para:

- upload valido (pdf/docx/img)
- rejeicao por MIME invalido
- rejeicao por tamanho > 10MB

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/escola/school_announcements_api.spec.ts --match "upload attachment"`
Expected: FAIL por rota/controller ausentes.

**Step 3: Write minimal implementation**

- Criar endpoint `POST /api/v1/school-announcements/attachments/upload`.
- Receber `multipart/form-data` e salvar arquivo em storage usado no projeto.
- Retornar metadados do arquivo pronto para vinculacao.
- Validar tipos e tamanho no backend.

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/upload_school_announcement_attachment_controller.ts start/routes/api/school_announcements.ts app/lib/file_security.ts app/validators/school_announcement.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): add attachment upload endpoint with validation"
```

### Task 4: Sincronizacao de anexos em criar/editar comunicado

**Files:**

- Modify: `app/controllers/school_announcements/create_school_announcement_controller.ts`
- Modify: `app/controllers/school_announcements/update_school_announcement_controller.ts`
- Create: `app/services/school_announcements/school_announcement_attachment_service.ts`
- Modify: `app/validators/school_announcement.ts`
- Test: `tests/functional/escola/school_announcements_api.spec.ts`

**Step 1: Write the failing test**

Adicionar testes para:

- criar comunicado com anexos vinculados
- editar comunicado e adicionar/remover anexos
- rejeitar payload com mais de 5 anexos

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/functional/escola/school_announcements_api.spec.ts --match "announcement attachments sync|max attachments"`
Expected: FAIL sem sincronizacao/validacao.

**Step 3: Write minimal implementation**

- Extender validator com lista de anexos (`attachmentIds` ou objetos equivalentes).
- Implementar service de sincronizacao (ordem + vinculo).
- Chamar service em create/update dentro de transacao.
- Aplicar regra de maximo 5 anexos por comunicado.

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/school_announcements/create_school_announcement_controller.ts app/controllers/school_announcements/update_school_announcement_controller.ts app/services/school_announcements/school_announcement_attachment_service.ts app/validators/school_announcement.ts tests/functional/escola/school_announcements_api.spec.ts
git commit -m "feat(comunicados): sync attachments on create and update"
```

### Task 5: UI escola (novo/editar) com upload multiplo

**Files:**

- Modify: `inertia/pages/escola/comunicados/novo.tsx`
- Modify: `inertia/pages/escola/comunicados/editar.tsx`
- Optional Create: `inertia/components/escola/announcement-attachments-field.tsx`
- Test: `tests/browser/escola/dashboard_view_mode.spec.ts` (ou novo teste browser especifico)

**Step 1: Write the failing test**

Adicionar teste browser para fluxo:

- selecionar arquivos validos
- ver itens na lista
- remover item
- bloquear mais de 5

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/browser/escola/dashboard_view_mode.spec.ts --match "announcement attachments"`
Expected: FAIL sem UI de anexos.

**Step 3: Write minimal implementation**

- Campo de upload multiplo no formulario.
- Upload assíncrono por arquivo via `mutateAsync` + `try/catch`.
- Mostrar progresso/estado simples e lista de anexos.
- Validacao client-side (tipo/tamanho/5 itens) com toast.
- Enviar anexos no payload de salvar comunicado.

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/pages/escola/comunicados/novo.tsx inertia/pages/escola/comunicados/editar.tsx inertia/components/escola/announcement-attachments-field.tsx tests/browser/escola/dashboard_view_mode.spec.ts
git commit -m "feat(comunicados): add multi-attachment upload UI for school"
```

### Task 6: UI responsavel para visualizar anexos

**Files:**

- Modify: `inertia/pages/responsavel/comunicados.tsx`
- Test: `tests/browser/responsavel/comunicados.spec.ts` (criar se nao existir)

**Step 1: Write the failing test**

Teste browser valida que comunicado com anexos exibe secao "Anexos" e links clicaveis.

**Step 2: Run test to verify it fails**

Run: `pnpm test --files tests/browser/responsavel/comunicados.spec.ts --match "announcement attachments"`
Expected: FAIL sem secao de anexos.

**Step 3: Write minimal implementation**

- Extender tipo local com `attachments`.
- Renderizar lista de links com nome do arquivo.
- Preservar layout atual (sem edicao).

**Step 4: Run test to verify it passes**

Run: mesmo comando do passo 2.
Expected: PASS.

**Step 5: Commit**

```bash
git add inertia/pages/responsavel/comunicados.tsx tests/browser/responsavel/comunicados.spec.ts
git commit -m "feat(responsavel): show announcement attachments"
```

### Task 7: Verificacao final integrada

**Files:**

- Modify as needed from previous tasks only

**Step 1: Run focused backend tests**

Run: `pnpm test --files tests/functional/escola/school_announcements_api.spec.ts`
Expected: PASS.

**Step 2: Run focused browser tests**

Run: `pnpm test --files tests/browser/escola/dashboard_view_mode.spec.ts --match "announcement attachments|simplified audience presets"`
Expected: PASS.

**Step 3: Run responsavel browser tests**

Run: `pnpm test --files tests/browser/responsavel/comunicados.spec.ts --match "announcement attachments"`
Expected: PASS.

**Step 4: Lint arquivos alterados**

Run: `pnpm exec eslint app/controllers/school_announcements/*.ts app/services/school_announcements/*.ts app/transformers/school_announcement*.ts app/models/school_announcement*.ts inertia/pages/escola/comunicados/*.tsx inertia/pages/escola/comunicados.tsx inertia/pages/responsavel/comunicados.tsx tests/functional/escola/school_announcements_api.spec.ts tests/browser/escola/dashboard_view_mode.spec.ts tests/browser/responsavel/comunicados.spec.ts`
Expected: sem erros.

**Step 5: Commit final de ajustes**

```bash
git add .
git commit -m "chore(comunicados): finalize announcement attachments flow"
```
