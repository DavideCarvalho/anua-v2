## Contexto

Comunicados ja existem como dominio proprio e geram notificacoes no sino.
Falta a confirmacao formal de leitura ("dar ciencia") com controle por comunicado.

## Decisoes validadas

- A escola escolhe se cada comunicado exige ciencia.
- Sem bloqueio total de app para responsavel.
- Dashboard do responsavel deve ter aviso persistente para pendencias de ciencia.
- Pendencia sai do aviso quando responsavel confirma ou quando prazo expira.
- Ao expirar, historico fica com status "ciencia expirada (nao confirmada)".

## Design

### Dados

- `SchoolAnnouncement`
  - `requiresAcknowledgement: boolean`
  - `acknowledgementDueAt: datetime | null`
- `SchoolAnnouncementRecipient`
  - `acknowledgedAt: datetime | null`

### Regras

- Se `requiresAcknowledgement=false`, nao existe pendencia de ciencia.
- Se `requiresAcknowledgement=true`, responsavel pode confirmar em endpoint dedicado.
- Estado derivado para UI:
  - `ACKNOWLEDGED`
  - `PENDING_ACK`
  - `EXPIRED_UNACKNOWLEDGED`
  - `NOT_REQUIRED`

### API

- Create/update de comunicado aceitam:
  - `requiresAcknowledgement`
  - `acknowledgementDueAt`
- Novo endpoint:
  - `POST /api/v1/responsavel/comunicados/:id/acknowledge`
- Novo endpoint para dashboard:
  - `GET /api/v1/responsavel/comunicados/pending-ack`

### UI

- Escola (novo/editar): checkbox "Exigir ciencia" + prazo opcional.
- Responsavel (comunicados): badge de status e botao "Li e estou ciente".
- Responsavel (dashboard): card persistente com pendencias nao expiradas.

### Testes

- Unit: regras de status derivado.
- Functional:
  - acknowledge idempotente
  - bloqueio para nao destinatario
  - pending-ack traz apenas nao expirados
