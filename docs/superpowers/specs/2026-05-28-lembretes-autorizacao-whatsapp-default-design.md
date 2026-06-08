# Lembretes de autorização (tipo correto) + WhatsApp default ON

**Data:** 2026-05-28
**Contexto:** Finalização da #30 (autorização eletrônica via Autentique) + ajuste sistêmico no default de canal WhatsApp.

## Problema

1. O job de lembrete de autorização parental (`start/jobs/send_parental_consent_reminders.ts`) já existe e roda diariamente (10h BR), mas dispara a notificação com `type: 'EVENT_REMINDER'`. Efeitos colaterais:
   - Aparece como **"Evento"** no sino, não **"Autorização"**.
   - Respeita a preferência de canal de `EVENT_REMINDER` do responsável, não a de `PARENTAL_CONSENT_REMINDER`.
2. O `NotificationService` manda WhatsApp por **default OFF** quando o usuário não tem preferência salva. A intenção do produto é: **default manda em todos os canais; a preferência do usuário é o que _subtrai_ um canal.** Email e push já seguem isso (default ON); WhatsApp é a exceção.
3. Bug visual adjacente: o toggle de **email** na UI de preferências mostra OFF por default (`?? false`) enquanto o comportamento real é ON.

## Decisão

### Parte A — Tipo correto no lembrete

`start/jobs/send_parental_consent_reminders.ts`: trocar `type: 'EVENT_REMINDER'` → `type: 'PARENTAL_CONSENT_REMINDER'`.

Mantém-se a cadência atual: lembrete diário dentro da janela de 3 dias (D-3, D-2, D-1, D-0) com throttle de 24h por consent. (O "D-3/D-1/D-0" do handoff era taquigrafia; o nudge diário é mais efetivo.)

### Parte B — WhatsApp default ON (sistêmico)

Flip do default `false` → `true` em todas as camadas que governam comportamento:

| Camada                             | Arquivo:linha                                                                               | Mudança                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Service fallback (lever principal) | `app/services/notification_service.ts:69`                                                   | `: false` → `: true`                     |
| Controller creation                | `app/controllers/notification_preferences/update_notification_preferences_controller.ts:65` | `enableWhatsApp = false` → `true`        |
| UI display                         | `inertia/containers/notifications/notification-preferences.tsx:244`                         | `?? false` → `?? true`                   |
| DB migration default               | nova `alterTable` migration                                                                 | coluna `enableWhatsApp` default → `true` |

### Bônus — Bug do toggle de email

`inertia/containers/notifications/notification-preferences.tsx:232`: `?? false` → `?? true` (UI passa a refletir o comportamento real, que é ON).

## Blast radius

Parte B é **sistêmica**: _toda_ notificação (comunicados, lembretes de evento, autorizações) passa a enviar WhatsApp por default para qualquer usuário com telefone e sem preferência salva. WhatsApp via Meta tem custo por mensagem. Reversível — a preferência do usuário continua subtraindo o canal.

Fora de escopo (apenas registrado): inconsistência do default de `enablePush` (migration `false` vs service/controller `true`).

## Verificação

- `node ace dev:otp` + consent de teste do responsável `resp.teste6@example.com`; rodar o job em `dryRun` e confirmar que loga como autorização.
- Conferir no sino que o lembrete aparece como "Autorização".
- Confirmar que usuário com telefone e sem preferência recebe WhatsApp (dispatch do `WhatsAppNotificationJob`).
- `node ace migration:run` aplica o novo default sem erro.
