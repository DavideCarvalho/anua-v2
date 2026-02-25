# Observability (OpenTelemetry + PostHog)

## O que ja esta configurado

- OTEL inicializado no boot do Adonis (`otel.ts` + `bin/server.ts`)
- Provider e middleware do OTEL registrados (`adonisrc.ts` e `start/kernel.ts`)
- Config basica em `config/otel.ts`
- Exportacao nativa para PostHog via `destinations` do `@adonisjs/otel` (traces + logs)
- evlog inicializado no boot (`start/evlog.ts`) com middleware de wide events (`app/middleware/evlog_middleware.ts`)

## Alternar facil: local x prod

Use a variavel `OTEL_EXPORT_TARGET`:

- `collector`: envia traces/logs para o OTEL Collector local
- `posthog`: envia traces/logs direto para o PostHog
- `disabled`: nao configura destino (desliga exportacao)

Exemplo local:

```env
OTEL_EXPORT_TARGET=collector
OTEL_COLLECTOR_ENDPOINT=http://localhost:4318
```

Exemplo prod:

```env
OTEL_EXPORT_TARGET=posthog
POSTHOG_PROJECT_TOKEN=phc_xxxxx
POSTHOG_OTEL_ENDPOINT_BASE=https://us.i.posthog.com/i
```

## evlog (wide events)

Variaveis:

```env
EVLOG_ENABLED=true
EVLOG_DRAIN_TARGET=none
EVLOG_POSTHOG_HOST=https://us.i.posthog.com
```

- `EVLOG_DRAIN_TARGET=none`: logs somente no console/arquivo local
- `EVLOG_DRAIN_TARGET=posthog`: envia wide events para PostHog Logs usando `POSTHOG_PROJECT_TOKEN`

## Enviar traces e logs direto para PostHog

No `.env`, configure:

```env
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://us.i.posthog.com/i/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer phc_xxxxx

# Configuracao deste projeto (config/otel.ts)
OTEL_EXPORT_TARGET=posthog
POSTHOG_PROJECT_TOKEN=phc_xxxxx
POSTHOG_OTEL_ENDPOINT_BASE=https://us.i.posthog.com/i
```

Com `POSTHOG_PROJECT_TOKEN` definido, o app envia `traces` e `logs` para o PostHog automaticamente.

## Stack local com Docker Compose

Suba Jaeger + OpenTelemetry Collector:

```bash
docker compose -f docker-compose.observability.yml up -d
```

UI do Jaeger:

- http://localhost:16686

Com isso, o app pode exportar OTEL para `http://localhost:4317`.

## Collector com fan-out para PostHog

Se quiser mandar para Jaeger local e PostHog ao mesmo tempo:

1. Copie `docker/otel/collector.posthog.yaml` para `docker/otel/collector.local.yaml` (ou troque o volume no compose).
2. Defina no ambiente do `docker compose`:

```env
POSTHOG_PROJECT_TOKEN=phc_xxxxx
POSTHOG_OTEL_ENDPOINT_BASE=https://us.i.posthog.com/i
```

Assim o collector recebe OTLP e exporta traces/logs para o PostHog.
