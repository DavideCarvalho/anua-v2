# Prompt pra próxima sessão

## Contexto
Estamos na auditoria de maio 2026 do Anuá v2. 28 de 40 itens fechados, 12 restantes. Arquivo de tracking: `AUDITORIA-2026-05.md`. Tudo commitado e em prod no Guara Cloud.

## Tarefas pendentes (em ordem de prioridade)

### 1. Backfill de gamificação (ace command)
Criar `node ace gamification:backfill` que:
- Pra cada tipo de evento (ATTENDANCE_PRESENT/LATE, GRADE_RECEIVED/EXCELLENT/GOOD, ASSIGNMENT_COMPLETED):
  - Busca o último `GamificationEvent` processado daquele tipo
  - Pega todos os registros (StudentHasAttendance, ExamGrade, StudentHasAssignment com grade) que vieram DEPOIS do último evento processado
  - Dispara `gamificationEventService.emitAttendanceMarked()` / `emitGradeReceived()` pra cada um
  - Se nunca teve evento daquele tipo, pega tudo
- Flag `--dry-run` pra ver quantos seriam processados sem disparar
- Flag `--since YYYY-MM-DD` pra limitar por data
- Log: quantos eventos por tipo foram criados

### 2. P0 #5 — Impersonation audit trail (1d)
- Criar model `AuditLog` com: userId, impersonatedSchoolId, action, entityType, entityId, before (JSON), after (JSON), createdAt
- Middleware que intercepta mutations (POST/PUT/DELETE) quando impersonation está ativo e loga antes/depois
- Tela em `/admin/audit` com timeline filtrável por user/escola/ação
- Reaproveitar padrão visual de `admin/ai/audit.tsx`

### 3. P0 #2 — Aluno autorresponsável (1d)
- Backend: devolver `isSelfResponsible` + `segment` (KIDS/TEEN/ADULT) no endpoint `/me` do aluno
- Frontend: quando `isSelfResponsible`, rotear pra layout adulto (sem gamification, com abas financeiro/documentos)
- Validar autorização por aluno no servidor (row-level access)
- O #36 (transição kids/teen) depende desse

### 4. P0 #4 — Modo gamified timeout + confirmação (1d)
- Timeout de 30 min em rotas `.gamified` (auto-redirect pra idle screen)
- Diálogo de confirmação obrigatório antes de gasto de pontos na loja
- Notificar responsável via push/email após compra do aluno

### 5. P1 #7 — Automação de inadimplência + acordo (2 sprints)
Fluxo:
1. Job detecta mensalidade OVERDUE > N dias configurável pela escola
2. Gera proposta de acordo (parcelamento 2x ou 3x) com status PENDING_SCHOOL_APPROVAL
3. Escola vê lista de acordos pendentes em `inadimplencia.tsx` e aprova/rejeita
4. Quando escola aprova, dispara comunicado pro responsável via email com link pra aceitar
5. Responsável aceita → recalcula cobrança, gera novas faturas parceladas
6. Coluna "dias em atraso" sortable no servidor (param `sortBy=daysOverdue` no endpoint)

Importante: proposta é criada automaticamente mas PRECISA de aprovação da escola antes de ir pro responsável.

Modelos necessários: Agreement (ou usar o existente), AgreementProposal (novo)
Controllers: CreateAgreementProposal, ApproveAgreementProposal, RejectAgreementProposal, AcceptAgreement (responsável)

### 6. P1 #8 — Matrícula salvar progresso (2 sprints)
- Persistir cada step do form em localStorage com schema versionado
- Restore on mount
- Componente DocumentCameraCapture (input file accept image, modal crop)
- Step "irmãos" reaproveitando endereço/responsáveis
- Stepper acessível com aria-progressbar

### 7. P1 #10 — Multi-rede admin (2-3 sprints)
- Switcher de "Rede X" no admin
- Dashboard agregado (matrículas/MRR/inadimplência por escola da rede)
- Fluxo de "aplicar config em todas as escolas"

### 8. P1 #11 — Comunicado multi-canal + agendamento (1-2 sprints)
- Seletor de canais (sistema, email, WhatsApp via Business API)
- Agendar para data/hora
- Templates recorrentes (já tem a base de templates)

### 9. P3 restantes (#30, #32, #33, #34, #40) — 1 sprint cada

## Notas técnicas
- O `tsconfig.inertia.json` tem 136 erros TS2345 estruturais do setup AdonisJS+Inertia+Tuyau (documentado no arquivo). Não são bugs.
- Usar Tuyau inline pra queries (memory: `feedback_anua_query_inline.md`)
- Nunca usar `disabled` pra validação, sempre toast/mensagem no clique (memory: `feedback_no_disabled_buttons.md`)
- Nunca usar `as`/`unknown`/`any`/`never` (memory: `feedback_avoid_loose_types.md`)
- Templates de comunicado agora são por escola (model AnnouncementTemplate, CRUD em `/api/v1/announcement-templates`)
- Payment gateway é agnóstico (PaymentGateway interface + AsaasPaymentGateway adapter em `app/services/payment/`)
- Webhook de pagamento usa mapper+processor (`AsaasWebhookMapper` → `PaymentWebhookProcessor`)
- Changelog in-app filtra por audience. Email digest gera texto por IA via `generateText` do Vercel AI SDK.
- VAPID keys estão no Guara Cloud. Subject: `mailto:suporte@anua.com.br`
- Silva Gomes: enrollmentValue zerado, todas matrículas com docusealSignatureStatus = SIGNED
- TrackActivityMiddleware roda no response pipeline (fix feito nessa sessão)
