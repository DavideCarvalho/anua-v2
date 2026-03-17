# Alertas de erro (PostHog + GCP + Discord)

Este runbook descreve como ativar visibilidade proativa de erros para evitar descoberta apenas por reclamacao de usuario.

## Objetivo

- Alertar no Discord quando houver anomalia/spike de erro
- Cobrir frontend, backend, workers/jobs e infraestrutura Cloud Run

## 1) GCP (Terraform)

Recursos provisionados via Terraform:

- `google_logging_metric.cloud_run_service_error_count`
- `google_logging_metric.cloud_run_job_error_count`
- `google_monitoring_alert_policy.cloud_run_service_errors`
- `google_monitoring_alert_policy.cloud_run_job_errors`

As policies usam `var.alert_notification_channel_ids`. Quando vazio (`[]`), as regras existem mas sem destino de notificacao.

Tambem foi provisionado segredo dedicado para webhook do Discord:

- `production-anua-v2-discord-alert-webhook`

### Aplicar infraestrutura

```bash
terraform -chdir=infra/terraform/envs/prod/foundation apply
terraform -chdir=infra/terraform/envs/prod/storage apply
terraform -chdir=infra/terraform/envs/prod/app apply
```

## 2) Configurar valor do webhook no Secret Manager

Depois de criar o segredo, adicione a versao com o webhook real:

```bash
gcloud secrets versions add production-anua-v2-discord-alert-webhook --data-file=-
```

Cole a URL do webhook no stdin e finalize com `Ctrl+D`.

## 3) Configurar canal de notificacao no Cloud Monitoring

Crie um Notification Channel (Webhook) no projeto e passe os IDs no Terraform, por exemplo em `terraform.tfvars` do stack `app`:

```hcl
alert_notification_channel_ids = [
  "projects/anua-480822/notificationChannels/1234567890"
]
```

## 4) PostHog (manual via UI)

Criar 3 insights e 3 alerts de anomalia:

1. Frontend exceptions (`$exception`)
2. Backend 5xx (eventos evlog com `status >= 500`)
3. Job failures (evento de falha de job)

Destino dos alerts: webhook do Discord.

## 5) Validacao ponta a ponta

1. Gerar erro controlado (500) na API
2. Confirmar log no Cloud Logging
3. Confirmar evento no PostHog
4. Confirmar mensagem no Discord em ate 5 minutos

## 6) Ajuste de ruido

- Se alertar demais, aumentar janela de agregacao
- Se alertar de menos, reduzir janela para detectar incidentes mais rapido
