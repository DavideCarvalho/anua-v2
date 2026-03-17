# Error Visibility Alerting Design

**Date:** 2026-03-13

## Goal

Detectar erros de producao antes de reclamacao de usuario, com notificacao automatica no Discord, usando apenas stack existente (PostHog + GCP + Terraform).

## Context

- O app ja envia excecoes frontend para PostHog (`$exception`).
- O backend envia wide events para PostHog via `evlog`.
- O deploy roda em Cloud Run/Cloud Run Jobs na GCP.
- Nao existe hoje camada ativa de alertas para equipe.

## Escopo

Implementar alertas em 4 superficies:

1. Excecoes JS frontend (PostHog)
2. Erros HTTP 5xx backend (PostHog/evlog)
3. Falhas em jobs/workers (PostHog/evlog)
4. Erros de infraestrutura Cloud Run (Cloud Logging/Monitoring)

## Arquitetura Escolhida

### 1) Alertas no PostHog (anomalia)

- Criar insights para series de erro por tipo.
- Configurar alertas de anomalia para cada insight.
- Entrega por webhook para Discord.

Observacao: configuracao de alertas do PostHog fica na propria plataforma (nao Terraform).

### 2) Alertas no GCP para erros de infra

- Criar log-based metrics para Cloud Run API e worker com filtro de erro.
- Criar `google_monitoring_notification_channel` (webhook) para Discord.
- Criar `google_monitoring_alert_policy` para deteccao de anomalia em taxa de erro.

### 3) Seguranca de segredo

- Nunca salvar webhook raw em repo.
- Guardar URL no Secret Manager como segredo dedicado de alerta.
- Consumir segredo no Terraform app stack.

## Trade-offs

- Pro: zero ferramenta nova, cobertura de app + infra, custo baixo.
- Contra: parte PostHog fica manual (UI/API) e sem versionamento completo em Terraform.

## Critrios de Sucesso

- Um erro real em producao gera alerta no Discord em ate 5 minutos.
- Spike/anomalia de erro gera alerta sem depender de reclamacao de usuario.
- Alertas contem contexto minimo: servico, rota/job, status, ambiente e link para investigacao.

## Nao Escopo

- On-call rotation/paging phone.
- Ferramenta externa dedicada (Sentry/Datadog/etc).
- Auto-remediacao.

## Rollout

1. Habilitar canal Discord e politica de alerta no GCP.
2. Validar com erro controlado em ambiente prod (janela curta).
3. Configurar insights + alerts no PostHog.
4. Ajustar ruido (sensitivity/cooldown) apos 1 semana.
