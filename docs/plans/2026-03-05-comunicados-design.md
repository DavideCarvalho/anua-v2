## Contexto

Hoje o produto mistura dois conceitos:

- `Notification` (canal de alerta para o usuario);
- "Comunicados" (conteudo editorial da escola para pais/responsaveis).

No estado atual:

- a escola tem tela de `notificacoes`, sem fluxo de criacao/publicacao de comunicados;
- o responsavel ve `/responsavel/comunicados`, mas a tela consome `api.v1.notifications.index`;
- eventos e outros fluxos (ex.: registro diario) geram notificacoes, mas nao sao comunicados editoriais.

Decisoes validadas com o usuario:

- comunicado e notificacao sao conceitos diferentes;
- comunicado pode gerar notificacoes;
- eventos continuam sendo dominio separado;
- MVP com publico de destino: apenas responsaveis.

## Objetivo

Introduzir um modulo de comunicados da escola com dominio proprio, mantendo notificacoes como mecanismo de entrega.

Resultado esperado no MVP:

- escola cria rascunhos e publica comunicados;
- publicacao gera notificacoes para responsaveis alvo;
- responsavel visualiza comunicados em modulo dedicado;
- eventos continuam com fluxo proprio e independente.

## Abordagens consideradas

1. Modulo separado de comunicados + notificacoes derivadas (escolhida)
   - Pro: separacao de dominio correta, melhor evolucao, auditoria clara.
   - Contra: custo inicial maior que reaproveitar estrutura atual.

2. Tratar comunicado como tipo de `Notification`
   - Pro: entrega rapida.
   - Contra: acoplamento conceitual, limita historico editorial e governanca.

3. Reaproveitar `EventNotification` para comunicados
   - Pro: evita criar tabela nova no curtissimo prazo.
   - Contra: semantica incorreta (comunicado != evento), aumenta divida tecnica.

## Design tecnico

### 1) Modelo de dados

Nova entidade principal:

- `SchoolAnnouncement`
  - `id`
  - `schoolId`
  - `title`
  - `body`
  - `status` (`DRAFT`, `PUBLISHED`)
  - `publishedAt` (nullable)
  - `createdByUserId`
  - `createdAt`, `updatedAt`

Nova entidade de rastreio de destinatarios:

- `SchoolAnnouncementRecipient`
  - `id`
  - `announcementId`
  - `studentId` (nullable; para contexto de vinculo quando houver)
  - `responsibleId`
  - `notificationId` (nullable; preenchido apos criar notificacao)
  - `createdAt`

Observacoes:

- `SchoolAnnouncement` e a fonte de verdade do conteudo editorial.
- `Notification` permanece como canal de entrega/alerta.
- `EventNotification` nao participa do fluxo de comunicados.

### 2) Regras de negocio

- Criacao inicial em `DRAFT` (nao dispara notificacoes).
- Edicao permitida somente em `DRAFT`.
- Publicacao faz transicao unica `DRAFT -> PUBLISHED`.
- Nova tentativa de publicar comunicado ja publicado retorna erro de estado invalido.
- Permissao de criacao/publicacao restrita a usuarios da escola com papeis autorizados.
- Responsavel tem acesso somente de leitura dos comunicados publicados destinados a ele.

### 3) Fluxo de publicacao

Ao publicar comunicado:

1. Validar escopo da escola e permissao do usuario executor.
2. Resolver destinatarios (MVP: responsaveis vinculados aos alunos da escola).
3. Em transacao:
   - atualizar comunicado para `PUBLISHED` e definir `publishedAt`;
   - criar `SchoolAnnouncementRecipient` para cada destinatario.
4. Criar notificacoes (`Notification`) para os destinatarios com:
   - `type: SYSTEM_ANNOUNCEMENT`;
   - `title` e resumo/conteudo do comunicado;
   - `actionUrl` apontando para detalhe do comunicado;
   - flags de canal in-app ativas no padrao atual.
5. Atualizar `notificationId` no recipient quando aplicavel.

Nota de robustez:

- para alto volume, a criacao de notificacoes pode ser enfileirada apos commit;
- no MVP pode iniciar sincrono se volume for controlado, preservando simplicidade.

### 4) API (MVP)

Novo namespace de API (exemplo):

- `GET /api/v1/school-announcements` (lista da escola)
- `POST /api/v1/school-announcements` (cria rascunho)
- `GET /api/v1/school-announcements/:id` (detalhe)
- `PUT /api/v1/school-announcements/:id` (edita rascunho)
- `POST /api/v1/school-announcements/:id/publish` (publica e dispara notificacoes)

Leitura para responsavel (pode ser no mesmo recurso com escopo por usuario):

- `GET /api/v1/responsavel/comunicados` (lista comunicados publicados e visiveis)
- `GET /api/v1/responsavel/comunicados/:id` (detalhe)

### 5) UX e paginas

Escola:

- Nova area de comunicados com lista e estados de rascunho/publicado.
- Tela de criacao/edicao de rascunho.
- Acao explicita de publicar.

Responsavel:

- Manter rota `/responsavel/comunicados`, mudando fonte para `SchoolAnnouncement`.
- Exibir lista de comunicados publicados com data e conteudo.

Notificacoes:

- `NotificationBell` continua no topo das areas.
- Notificacao de comunicado abre detalhe do comunicado via `actionUrl`.

Eventos:

- Permanecem no proprio dominio (`/escola/eventos`) e com notificacoes proprias.
- Nao entram na listagem editorial de comunicados.

## Estrategia de rollout

1. Entregar backend de comunicados (modelos, migracoes, controllers, validadores, rotas).
2. Entregar UI da escola (lista + criar/editar rascunho + publicar).
3. Migrar UI do responsavel para ler de comunicados.
4. Manter notificacoes existentes sem regressao.

## Criterios de pronto (MVP)

- Escola consegue criar rascunho de comunicado.
- Escola consegue publicar comunicado uma unica vez.
- Publicacao gera notificacoes para responsaveis alvo.
- Responsavel visualiza comunicado em `/responsavel/comunicados`.
- Clique na notificacao direciona para detalhe do comunicado.
- Eventos continuam separados e sem regressao funcional.

## Riscos e mitigacoes

- Risco: alto volume de destinatarios na publicacao.
  - Mitigacao: arquitetura pronta para enfileirar envio de notificacoes.

- Risco: ambiguidade de permissao entre papeis da escola.
  - Mitigacao: definir policy explicita de quem cria/publica ainda no backend.

- Risco: inconsistencias entre comunicado publicado e notificacao entregue.
  - Mitigacao: transacao para estado principal + rastreio de recipients.

## Fora de escopo do MVP

- Segmentacao avancada (turma, periodo, nivel) na tela de publicacao.
- Agendamento de publicacao futura.
- Cancelar publicacao ou editar comunicado publicado.
- CRUD completo de exclusao (preferir evolucao para arquivamento).
- Canais extras fully managed (push, sms, whatsapp) alem do baseline atual.
