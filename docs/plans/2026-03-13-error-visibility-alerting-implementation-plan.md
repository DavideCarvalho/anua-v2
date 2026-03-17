# Error Visibility Alerting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar alertas proativos de erros (frontend, backend, jobs e infra) no Discord usando PostHog + GCP, sem adicionar nova ferramenta paga.

**Architecture:** A camada de app errors fica no PostHog (insights + anomaly alerts + webhook). A camada de infraestrutura fica no Cloud Monitoring com log-based metrics e alert policies. O webhook do Discord nao entra em codigo/versionamento: vai para Secret Manager e e consumido por provisionamento/operacao.

**Tech Stack:** AdonisJS, PostHog, GCP Cloud Run, Cloud Logging, Cloud Monitoring, Terraform (hashicorp/google ~> 7.0).

---

### Task 1: Preparar segredo de alerta no Terraform (sem vazar webhook)

**Files:**

- Modify: `infra/terraform/envs/prod/storage/main.tf`
- Modify: `infra/terraform/envs/prod/storage/outputs.tf`
- Modify: `infra/terraform/envs/prod/app/data.tf`
- Test: `infra/terraform/envs/prod/storage/main.tf` (terraform validate)

**Step 1: Escrever validacao que falha sem o novo output**

Comando:

```bash
terraform -chdir=infra/terraform/envs/prod/storage validate
```

Expected before changes: PASS (baseline).

Depois, adicione referencia ao output no app stack sem criar output no storage e rode:

```bash
terraform -chdir=infra/terraform/envs/prod/app validate
```

Expected: FAIL com erro de output inexistente no `terraform_remote_state.storage.outputs`.

**Step 2: Implementar segredo e output minimo**

Adicionar em `infra/terraform/envs/prod/storage/main.tf`:

```hcl
resource "google_secret_manager_secret" "discord_alert_webhook" {
  secret_id = "${var.environment}-${var.project_name}-discord-alert-webhook"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "discord_alert_webhook_access" {
  secret_id = google_secret_manager_secret.discord_alert_webhook.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
```

Adicionar em `infra/terraform/envs/prod/storage/outputs.tf`:

```hcl
output "discord_alert_webhook_secret_id" {
  description = "Secret ID for Discord alert webhook"
  value       = google_secret_manager_secret.discord_alert_webhook.secret_id
}
```

Adicionar em `infra/terraform/envs/prod/app/data.tf`:

```hcl
data "google_secret_manager_secret_version" "discord_alert_webhook" {
  secret  = data.terraform_remote_state.storage.outputs.discord_alert_webhook_secret_id
  version = "latest"
}
```

**Step 3: Rodar validacao novamente**

```bash
terraform -chdir=infra/terraform/envs/prod/storage validate
terraform -chdir=infra/terraform/envs/prod/app validate
```

Expected: PASS nos dois stacks.

**Step 4: Commit**

```bash
git add infra/terraform/envs/prod/storage/main.tf infra/terraform/envs/prod/storage/outputs.tf infra/terraform/envs/prod/app/data.tf
git commit -m "infra: add Secret Manager resource for Discord alert webhook"
```

### Task 2: Provisionar monitoramento GCP para erros de Cloud Run

**Files:**

- Modify: `infra/terraform/envs/prod/foundation/main.tf`
- Create: `infra/terraform/envs/prod/app/monitoring.tf`
- Test: `infra/terraform/envs/prod/app/monitoring.tf` (terraform validate + plan)

**Step 1: Escrever configuracao que falha por API nao habilitada**

Criar `infra/terraform/envs/prod/app/monitoring.tf` com recurso de log metric e alert policy (abaixo) sem habilitar APIs em foundation, depois rodar:

```bash
terraform -chdir=infra/terraform/envs/prod/app plan -out=tfplan
```

Expected: FAIL em projeto novo/limpo se `monitoring.googleapis.com` e `logging.googleapis.com` nao estiverem habilitadas.

**Step 2: Habilitar APIs necessarias**

Em `infra/terraform/envs/prod/foundation/main.tf`, incluir no `required_apis`:

```hcl
"monitoring.googleapis.com",
"logging.googleapis.com",
```

**Step 3: Implementar metricas e alertas**

Criar `infra/terraform/envs/prod/app/monitoring.tf`:

```hcl
resource "google_logging_metric" "cloud_run_error_count" {
  name        = "cloud_run_error_count"
  description = "Count Cloud Run error logs for API and worker"
  filter      = <<-EOT
resource.type="cloud_run_revision"
resource.labels.service_name=~"production-anua-v2-api|production-anua-v2-queue-worker"
severity>=ERROR
EOT
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

resource "google_monitoring_alert_policy" "cloud_run_error_anomaly" {
  display_name = "anua-v2 cloud run error anomaly"
  combiner     = "OR"

  conditions {
    display_name = "error log anomaly"
    condition_monitoring_query_language {
      duration = "300s"
      query = <<-EOT
fetch logging.googleapis.com/user/cloud_run_error_count
| align rate(1m)
| every 1m
| group_by [], sum
| condition gt(val(), 0)
EOT
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    content   = "Cloud Run error spike detected. Check Cloud Logging and PostHog traces."
    mime_type = "text/markdown"
  }

  enabled = true
}
```

Observacao: conexao direta para Discord via channel webhook varia por tipo de autenticacao. Se o tipo nao aceitar Discord nativamente sem expor URL, criar bridge Pub/Sub -> Cloud Run notifier no Task 5 opcional.

**Step 4: Validar e planejar**

```bash
terraform -chdir=infra/terraform/envs/prod/foundation validate
terraform -chdir=infra/terraform/envs/prod/app validate
terraform -chdir=infra/terraform/envs/prod/app plan -out=tfplan
```

Expected: PASS no validate e PLAN sem erros.

**Step 5: Commit**

```bash
git add infra/terraform/envs/prod/foundation/main.tf infra/terraform/envs/prod/app/monitoring.tf
git commit -m "infra: add Cloud Monitoring error metrics and alert policy"
```

### Task 3: Criar runbook de alertas PostHog + Discord

**Files:**

- Create: `docs/observability-alerts.md`
- Modify: `docs/observability.md`
- Test: `docs/observability-alerts.md` (checklist execution)

**Step 1: Escrever checklist que falha antes da doc**

Criar checklist manual (sem arquivo ainda):

- Insight para `$exception` existe?
- Insight para `status >= 500` existe?
- Insight para `job_failed` existe?
- Todos com alerta de anomalia ativo?
- Destino Discord configurado?

Expected: FAIL (itens nao confirmados).

**Step 2: Documentar processo completo**

Criar `docs/observability-alerts.md` com:

```markdown
# Alertas de Erro (PostHog + GCP + Discord)

## PostHog

- Insight 1: Frontend JS exceptions (`$exception`)
- Insight 2: Backend HTTP 5xx (evento evlog com `status >= 500`)
- Insight 3: Job failures (`event = job_failed`)
- Alert type: Anomaly detection
- Delivery: Webhook Discord

## GCP

- Log metric: `cloud_run_error_count`
- Alert policy: `anua-v2 cloud run error anomaly`

## Teste de ponta a ponta

1. Gerar erro controlado 500 em rota de teste.
2. Confirmar evento no PostHog em ate 2 minutos.
3. Confirmar alerta Discord em ate 5 minutos.
```

Adicionar link para esse runbook em `docs/observability.md`.

**Step 3: Executar checklist novamente**

Expected: PASS (checklist completo e rastreavel em doc).

**Step 4: Commit**

```bash
git add docs/observability.md docs/observability-alerts.md
git commit -m "docs: add PostHog and GCP error alerting runbook"
```

### Task 4: Validacao operacional em producao

**Files:**

- Modify: `docs/observability-alerts.md`
- Test: `docs/observability-alerts.md` (evidence section)

**Step 1: Gerar teste controlado que falha sem evidencia**

Rodar um teste de erro controlado (janela curta) e exigir evidencia:

```bash
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="production-anua-v2-api" AND severity>=ERROR' --limit=20 --format=json
```

Expected before evidence block: FAIL no criterio de aceite (sem timestamps/links).

**Step 2: Registrar evidencia de validacao**

Adicionar secao `## Evidence` em `docs/observability-alerts.md` com:

- timestamp UTC do erro gerado
- screenshot/link do evento no PostHog
- screenshot/link da mensagem no Discord
- tempo total deteccao -> alerta

**Step 3: Revalidar criterios**

Expected: PASS com evidencia completa.

**Step 4: Commit**

```bash
git add docs/observability-alerts.md
git commit -m "docs: record alerting validation evidence"
```

### Task 5 (Optional): Bridge GCP -> Discord sem expor webhook em notification channel

**Files:**

- Create: `app/controllers/internal/monitoring_webhook_controller.ts`
- Modify: `start/routes.ts`
- Modify: `start/env.ts`
- Modify: `.env.example`
- Create: `tests/functional/monitoring/discord_bridge.spec.ts`

**Step 1: Escrever teste funcional falhando para relay**

```ts
test('forwards monitoring webhook payload to discord', async ({ client, assert }) => {
  const response = await client
    .post('/internal/monitoring/discord-bridge')
    .json({ incident: { id: 'inc-1' } })
  response.assertStatus(202)
  assert.isTrue(true)
})
```

**Step 2: Rodar teste e confirmar falha**

```bash
node ace test functional --files tests/functional/monitoring/discord_bridge.spec.ts
```

Expected: FAIL com rota/controller inexistente.

**Step 3: Implementar minimo para passar**

- Endpoint interno autenticado por token
- Leitura de `DISCORD_ALERT_WEBHOOK_URL` via env
- POST formatado para Discord

**Step 4: Rodar teste e confirmar sucesso**

```bash
node ace test functional --files tests/functional/monitoring/discord_bridge.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/controllers/internal/monitoring_webhook_controller.ts start/routes.ts start/env.ts .env.example tests/functional/monitoring/discord_bridge.spec.ts
git commit -m "feat: add secure GCP-to-Discord alert bridge"
```
