# Anuá v2 - Contexto do Projeto

## Stack
- **Backend**: AdonisJS 7 (TypeScript) + Inertia.js + React 19
- **Banco**: PostgreSQL (Lucid ORM)
- **Fila**: `@adonisjs/queue` (database driver)
- **Cache**: `@adonisjs/cache` (bentocache, database store)
- **Email**: Resend API (`@adonisjs/mail` transport resend)
- **Storage**: MinIO (S3-compatible, via `@adonisjs/drive`)
- **Autenticação**: Session Guard + OTP por email
- **Pagamentos**: Asaas
- **Observabilidade**: PostHog (evlog + OpenTelemetry)

## Infraestrutura (Guara Cloud)

### Projeto: `anu` (slug)
- **Plano**: Business (R$199/mês)
- **Região**: br-gru (Brasil)

### Serviços

| Serviço | Slug | Tipo | Função |
|---------|------|------|--------|
| App-prod | `app-e0fd51` | Web | HTTP + schedules |
| Queue-prod | `queue-prod-174a07` | Worker | `queue:work` + schedules |
| anua-db | `anua-db-7a642d` | PostgreSQL 17 | Banco de dados (5GB) |
| anua-storage | `anua-storage-28cfda` | MinIO | Storage S3 (10GB) |

### Domínio
- **www.anuaapp.com.br** → CNAME `app-e0fd51-anu.guaracloud.com` (Cloudflare proxy)
- **anuaapp.com.br** → redirect 301 para www (Page Rule no Cloudflare)

### CLI Guara
```bash
guara login                    # Autenticar
guara projects list            # Listar projetos
guara services list            # Listar serviços
guara services info            # Detalhes do serviço
guara env set KEY=val          # Definir env var
guara env list                 # Listar env vars
guara env unset KEY            # Remover env var
guara deploy                   # Fazer deploy
guara deployments list         # Histórico de deploys
guara logs --follow            # Logs em tempo real
guara exec -- node cmd         # Executar comando no container
guara proxy --local-port N     # Proxy para serviço privado
guara catalog deploy postgres  # Deploy de serviço gerenciado
guara catalog query --query "" # Query SQL (read-only) no banco gerenciado
guara services restart         # Restart com rolling update
guara services credentials     # Credenciais de serviço gerenciado
guara scale --autoscaling on   # Habilitar autoscaling
```

### Env vars importantes
- `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` → PostgreSQL
- `DRIVE_DISK=s3` / `S3_KEY` / `S3_SECRET` / `S3_BUCKET` / `S3_ENDPOINT` → MinIO
- `RESEND_API_KEY` → Email (Resend API)
- `ASAAS_API_KEY` / `ASAAS_WEBHOOK_URL` / `ASAAS_WEBHOOK_TOKEN` → Pagamentos
- `QUEUE_DRIVER=database` → Fila via PostgreSQL
- `SESSION_DRIVER=cookie` → Sessão
- `EVLOG_ENABLED=true` / `EVLOG_DRAIN_TARGET=posthog` → Observabilidade

## Schedules (@adonisjs/queue nativo)
Definidos em `start/scheduler.ts`. O próprio worker (`queue:work`) do `@adonisjs/queue` verifica schedules a cada 30s.

| Horário | Job |
|---------|-----|
| 00:00 | `update_streaks` (gamificação) |
| 02:00 | `generate_missing_payments` |
| 03:00 | `generate_invoices` |
| 04:00 (dia 1) | `generate_subscription_invoices` |
| 04:30 | `retry_subscription_invoice_charges` |
| 05:00 | `refresh_overdue_invoices` |
| 05:30 | `create_meal_recurrence_reservations` |
| 06:00 | `create_invoice_asaas_charges` |
| 06:30 | `send_invoice_notifications` |
| 08:00 | `sweep_pending_asaas_documents` |
| 09:00 (seg-sex) | `send_occurrence_ack_reminders` |
| */15 * * * * | `retry_pending_events` (gamificação) |

## Migração GCP → Guara
- GCP Cloud SQL → PostgreSQL no Guara (dump manual com `pg_dump` + `guara proxy`)
- GCP Cloud Run (API + Worker + Scheduler) → Serviços no Guara
- GCS (Google Cloud Storage) → MinIO no Guara
- Cloud Scheduler (10 crons) → `@adonisjs/queue` schedules nativos
- Domínio: Cloudflare na frente (www.anuaapp.com.br)

## Login para testes com Chrome DevTools

O app usa autenticação por OTP (código de 6 dígitos enviado por email, armazenado em `bentocache` no PostgreSQL). Para logar via Chrome DevTools/Playwriter:

```bash
# 1. Server deve estar rodando apontando pro DB correto
# O antigo DB (34.39.158.54) tem os mesmos dados e não tem limitação de conexão

# 2. No Chrome DevTools (api tool), navegar pro /login

# 3. Preencher email (usar evaluate_script se fill falhar):
const input = document.querySelector('input[type="email"]')
const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
s.call(input, 'email@exemplo.com')
input.dispatchEvent(new Event('input', { bubbles: true }))
input.dispatchEvent(new Event('change', { bubbles: true }))

# 4. Clicar "Enviar código":
document.querySelector('button').click()

# 5. Buscar OTP no banco:
node -e "
const { Client } = require('pg')
const c = new Client({ host:'34.39.158.54', port:5432, user:'app_user',
  password:'S-FO:E(9Q%Lv=G!%Y\$or2u#eo1#flNv}', database:'school_super_app' })
c.connect().then(async()=>{
  const r = await c.query(\"SELECT value FROM bentocache WHERE key = 'bentocache:verification:EMAIL' \")
  const val = JSON.parse(r.rows[0].value)
  console.log('OTP:', val.value.code)
  await c.end()
}).catch(e=>console.log('ERR:',e.message))
"

# 6. Chamar API de verify-code diretamente:
fetch('/api/v1/auth/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'email@exemplo.com', code: '123456' })
})
# → Seta cookie de sessão, usuário logado
```

**Nota:** O `guara proxy` do banco Guara Cloud (`anua-db-7a642d`) só aceita **uma conexão por vez**, então usar o old DB (34.39.158.54) pra dev + queries é mais prático quando precisa de múltiplas consultas.

## Comandos úteis
```bash
# Executar migrations
guara exec --service app-e0fd51 -- node ace migration:run --force

# Ver logs de erro
guara logs --level error

# Acessar banco localmente via proxy
guara proxy --service anua-db-7a642d --local-port 5432

# Enviar novo deploy
git push origin main  # auto-deploy habilitado
```
