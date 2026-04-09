# GCP to GuaraCloud Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar o deploy de producao do `anua-v2` de GCP (Cloud Run + Scheduler + Artifact Registry) para GuaraCloud com rollback seguro e sem downtime relevante.

**Architecture:** A migracao acontece em duas fases: (1) infraestrutura de runtime e deploy (API + worker + variaveis/secrets + dominio), mantendo toda a stack GCP atual intacta; (2) migracao/ajuste de jobs agendados e observabilidade no novo ambiente. O pipeline GitHub Actions deixa de usar `gcloud` e passa a usar `guara` CLI para build/deploy. O rollback inicial continua via `guara rollback` e switch de DNS controlado.

**Tech Stack:** Terraform (estado atual), GitHub Actions, Docker, Guara CLI, AdonisJS, Postgres externo, DNS.

---

### Task 1: Inventariar dependencias GCP que afetam runtime

**Files:**

- Modify: `docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md`
- Read-only references: `infra/terraform/envs/prod/app/main.tf`, `infra/terraform/envs/prod/storage/main.tf`, `infra/terraform/envs/prod/foundation/main.tf`, `.github/workflows/deploy.yml`

**Step 1: Mapear servicos e jobs em execucao**

Extrair a lista completa de componentes atualmente deployados:

- API (`module.api`)
- Queue worker (`module.queue_worker`)
- Jobs de dispatch (todos os `module.dispatch_*`)
- Schedulers (todos os `module.scheduler_*`)

**Step 2: Mapear variaveis e secrets obrigatorios**

Consolidar env/secrets criticos usados por API/worker/jobs:

- DB: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_DATABASE`, `DB_PASSWORD`
- App: `APP_KEY`, `NODE_ENV`, `SESSION_DRIVER`, `TZ`, `LOG_LEVEL`
- SMTP e Asaas
- Observabilidade PostHog/evlog

**Step 3: Mapear acoplamentos GCP nao cobertos por Guara CLI**

Marcar explicitamente itens sem comando equivalente na doc da Guara CLI:

- Cloud Scheduler cron -> precisa estrategia alternativa
- Secret Manager IAM -> substituido por `guara env set` (segredo gerenciado pela plataforma)
- Artifact Registry + WIF -> substituido por fluxo de build/deploy Guara

**Step 4: Verificacao**

Checklist minimo:

- [ ] Nenhum job/scheduler ficou fora do inventario
- [ ] Lista de env/secrets contem todos os obrigatorios
- [ ] Gap de scheduler documentado antes da execucao

**Step 5: Commit**

```bash
git add docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md
git commit -m "docs: add gcp-to-guaracloud migration inventory"
```

### Task 2: Provisionar projeto e servicos base no GuaraCloud

**Files:**

- Create: `.guara.json` (gerado por `guara link`)
- Create: `.env.guara.production` (arquivo local para import de env)
- Modify: `docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md`

**Step 1: Autenticar no GuaraCloud**

```bash
guara login --api-key "$GUARA_API_KEY"
guara whoami
```

Esperado: usuario autenticado corretamente.

**Step 2: Criar projeto Guara**

```bash
guara projects create --name anua-v2 --region br-gru
guara projects list --json
```

**Step 3: Criar servico API**

```bash
guara services create --name api --build-method dockerfile --port 3333 --public --project anua-v2
```

**Step 4: Criar servico queue-worker**

```bash
guara services create --name queue-worker --build-method dockerfile --port 8080 --project anua-v2
```

**Step 5: Vincular repo ao projeto/servico**

```bash
guara link --project anua-v2 --service api --yes
```

**Step 6: Verificacao**

```bash
guara services list --project anua-v2
guara services info --project anua-v2 --service api
guara services info --project anua-v2 --service queue-worker
```

Esperado: ambos servicos ativos com build method `dockerfile`.

**Step 7: Commit**

```bash
git add .guara.json
git commit -m "chore: link repository to guaracloud project"
```

### Task 3: Migrar configuracao de ambiente e segredos

**Files:**

- Create: `.env.guara.production` (nao versionar)
- Modify: `.gitignore` (garantir ignore do arquivo)
- Modify: `docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md`

**Step 1: Garantir que arquivo de env nao sera commitado**

Adicionar em `.gitignore`:

```text
.env.guara.production
```

**Step 2: Preparar arquivo com variaveis necessarias**

Template minimo:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
TZ=UTC
LOG_LEVEL=info
APP_NAME=Anua
APP_VERSION=0.0.0
SESSION_DRIVER=cookie
QUEUE_DRIVER=database
DISABLE_SCHEDULER=1
DB_HOST=...
DB_PORT=5432
DB_USER=app_user
DB_DATABASE=school_super_app
DB_PASSWORD=...
APP_KEY=...
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=Anua <dont-reply@transactional.anuaapp.com.br>
DRIVE_DISK=gcs
GCS_BUCKET=...
ASAAS_API_KEY=...
ASAAS_WEBHOOK_URL=...
ASAAS_WEBHOOK_TOKEN=...
POSTHOG_PROJECT_TOKEN=...
OTEL_SERVICE_NAME=Anua
OTEL_EXPORT_TARGET=posthog
POSTHOG_OTEL_ENDPOINT_BASE=https://us.i.posthog.com/i
EVLOG_ENABLED=true
EVLOG_DRAIN_TARGET=posthog
EVLOG_POSTHOG_HOST=https://us.i.posthog.com
```

**Step 3: Aplicar variaveis no servico API**

```bash
guara env set --from-file .env.guara.production --project anua-v2 --service api
guara env list --project anua-v2 --service api
```

**Step 4: Aplicar variaveis no queue-worker**

Usar o mesmo arquivo e sobrescrever apenas se necessario parametros especificos do worker.

```bash
guara env set --from-file .env.guara.production --project anua-v2 --service queue-worker
guara env list --project anua-v2 --service queue-worker
```

**Step 5: Verificacao**

Validar presenca dos envs criticos (sem expor valores) via `guara env list`.

**Step 6: Commit**

```bash
git add .gitignore docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md
git commit -m "chore: document guaracloud env migration"
```

### Task 4: Migrar pipeline de deploy para Guara CLI

**Files:**

- Modify: `.github/workflows/deploy.yml`
- Test: execução manual do workflow `deploy`

**Step 1: Remover etapas GCP-specific**

Remover blocos:

- `google-github-actions/auth@v2`
- `google-github-actions/setup-gcloud@v2`
- `gcloud auth configure-docker`
- `gcloud run services/jobs update`

**Step 2: Adicionar setup da Guara CLI e autenticacao**

Adicionar etapas:

- instalar Guara CLI
- exportar `GUARA_API_KEY` via GitHub Secret
- `guara login --api-key "$GUARA_API_KEY"`

**Step 3: Deploy API e worker via Guara**

Comandos alvo:

```bash
guara link --project anua-v2 --service api --yes
guara deploy --commit ${{ github.sha }}

guara link --project anua-v2 --service queue-worker --yes
guara deploy --commit ${{ github.sha }}
```

**Step 4: Adicionar verificacao pos-deploy**

```bash
guara deployments list --project anua-v2 --service api --json
guara deployments list --project anua-v2 --service queue-worker --json
```

**Step 5: Verificacao local de sintaxe workflow**

```bash
yaml-lint .github/workflows/deploy.yml
```

Esperado: arquivo valido e sem referencias `gcloud`.

**Step 6: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: migrate deployment workflow from gcloud to guara cli"
```

### Task 5: Definir estrategia para jobs agendados (scheduler)

**Files:**

- Modify: `start/scheduler.ts`
- Modify: `infra/terraform/envs/prod/app/main.tf` (apenas quando desativar cron legado)
- Create: `docs/runbooks/guara-scheduler-migration.md`

**Step 1: Escolher estrategia de execucao de cron**

Como a CLI publica nao expoe scheduler dedicado, escolher uma das opcoes:

- A) Rodar scheduler interno no worker (`DISABLE_SCHEDULER=0` no worker)
- B) GitHub Actions cron chamando comandos `dispatch:*`
- C) Servico externo de cron HTTP/webhook

**Step 2: Implementar estrategia escolhida com minimo de mudancas**

Preferencia inicial: opcao A para reduzir moving parts.

**Step 3: Criar runbook de operacao/rollback do scheduler**

Documentar:

- como pausar
- como retomar
- como validar execucao
- como evitar duplicidade em janela de migracao

**Step 4: Verificacao**

Executar check funcional:

- disparar job de teste de baixa criticidade
- conferir logs e efeito esperado

**Step 5: Commit**

```bash
git add start/scheduler.ts docs/runbooks/guara-scheduler-migration.md
git commit -m "feat: migrate scheduled dispatch execution strategy for guaracloud"
```

### Task 6: Cutover de dominio, observabilidade e rollback

**Files:**

- Modify: `docs/observability.md`
- Modify: `docs/observability-alerts.md`
- Create: `docs/runbooks/guara-cutover.md`

**Step 1: Publicar dominio customizado no Guara**

```bash
guara domains add --domain api.anuaapp.com.br --project anua-v2 --service api
guara domains list --project anua-v2 --service api
```

**Step 2: Ajustar DNS com janela controlada**

Configurar CNAME conforme alvo exibido pelo `guara domains add`.

**Step 3: Smoke tests pos-cutover**

Executar:

- healthcheck raiz
- login
- fluxo de pagamento
- upload de arquivo
- envio de email transacional

**Step 4: Preparar rollback operacional**

Comandos de rollback rapido:

```bash
guara rollback --project anua-v2 --service api
guara rollback --project anua-v2 --service queue-worker
```

E rollback de DNS para endpoint antigo em caso de incidente.

**Step 5: Atualizar docs e declarar prontidao**

Registrar novo procedimento de deploy/ops nos docs.

**Step 6: Commit**

```bash
git add docs/observability.md docs/observability-alerts.md docs/runbooks/guara-cutover.md
git commit -m "docs: add guaracloud cutover and rollback runbooks"
```

### Scope Note: Sem desativar/remover recursos GCP agora

**Files:**

- Modify: `docs/plans/2026-04-01-gcp-to-guaracloud-migration-implementation-plan.md`

**Step 1: Congelar alteracoes destrutivas no GCP**

Nao executar `terraform apply` para remover recursos GCP durante esta fase.

**Step 2: Operar em paralelo durante onboarding no GuaraCloud**

Manter Cloud Run, Jobs, Scheduler, Secret Manager e Artifact Registry ativos ate decisao explicita de decomissionamento.

**Step 3: Verificacao**

Checklist:

- [ ] Nenhum recurso GCP foi removido
- [ ] Migracao no GuaraCloud ocorreu em paralelo
- [ ] Rollback para runtime atual continua disponivel
