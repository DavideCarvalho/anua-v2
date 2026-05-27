# Auditoria Anuá v2, maio 2026

Lista de oportunidades pra trackear melhoria de fluxo (feature), negócio e UI/UX. Síntese de 4 auditorias paralelas (Escola, Responsável+Aluno, Matrícula Online+Admin, Consistência DESIGN.md).

**Legenda:** P0 bloqueante ou risco, P1 alta ROI, P2 quick win, P3 backlog. Áreas: `feature`, `ux`, `negocio`, `design`, `risco`.

## Log de execução

**2026-05-21, sessão 1** (commits ainda no working tree, sem push)
- Concluídos: #15, #16, #17, #18 (parcial: só sign-in, outros 8 arquivos com blur são purposeful), #22 (sem sort do servidor), #23, #24, #26. 8 quick wins.
- Arquivos tocados: 9 (`audit-diff-card.tsx`, `pedagogical-alerts-cards.tsx`, `student-payments-container.tsx`, `new-attendance-modal.tsx`, `sign-in.tsx`, `escola/comunicados.tsx`, `escola/comunicados/novo.tsx`, `pedagogico/grade.tsx`, `responsavel/comunicados.tsx`).
- Diff stat: +202 / -68 linhas. Typecheck verde. Console limpo em todas as páginas testadas.
- Validação visual: Chrome MCP em localhost:3333, login como Marcos Diretor + impersonate Cleiton Pai (Responsável) pra testar #26.
- Achado adicional: `containers/dashboard/pedagogical-alerts-cards.tsx` é código órfão (zero importações). Substituído pelo painel "Insights" do dashboard. Fix aplicado por segurança mas vale considerar remover o arquivo.
- Pulados conscientemente: #19, #20, #21, #25, #27, #28 (todos exigem decisão de produto ou backend novo, não são quick wins genuínos).
- Próximo passo natural: rodar uma onda de P1 (PIX inline #6, automação de inadimplência #7) ou despachar um #19/#20 como mini-feature.

**2026-05-26, sessão 2**
- Concluídos: #1 (P0), #3 (P0), #6 (P1), #9 (P1), #12 (P1), #13 (P1). 6 itens.
- Arquivos criados: `calendar_token_service.ts`, `get_calendar_feed_controller.ts`, `get_calendar_feed_url_controller.ts`, `enrollment_axes_transformer.ts`, `get_school_health_controller.ts`, `school-health.tsx`.
- Arquivos editados: `get_student_invoices_controller.ts`, `student-payments-container.tsx`, `sign-in.tsx`, `enrollment_axes_service.ts`, `get_enrollment_axes_controller.ts`, `matricula-axes-container.tsx`, `calendario.tsx`, `responsavel.ts` (rotas), `index.ts` (rotas), `admin.ts` (rotas API + pages), `analytics/index.tsx`, `track_activity_middleware.ts`.
- Validação #1: Chrome MCP, impersonando Alessandra Adriana. Popover "Como pagar" com fallback genérico.
- Validação #3: Chrome MCP (contexto incognito). Zero gradientes, zero blur, zero indigo.
- Validação #12: Chrome MCP. Feed .ics retorna VCALENDAR válido, popover com Google/Apple/Copiar.
- Validação #9: Typecheck verde. SLA labels e timestamps integrados ao AxisSection.
- Validação #13: Chrome MCP. Dashboard com 185 escolas, Silva Gomes "Ativo" com 5 features, filtros funcionando.
- Fix extra: `TrackActivityMiddleware` movido pro response pipeline (nunca trackeava, 1158 users com zero lastLoggedInAt).
- Seed: Subscription ACTIVE + plano Básico criados pra Silva Gomes.
- Typecheck verde (backend + frontend).

**2026-05-27, sessão 3**
- Concluídos: #6 webhook agnóstico, #19 (P2), #20 (P2 parcial), #21 (P2), #25 (P2), #27 (P2), #28 (P2). + preview de comunicado + botão limpar.
- Arquivos criados: `payment_gateway.ts`, `asaas_payment_gateway.ts`, `payment_webhook_types.ts`, `asaas_webhook_mapper.ts`, `payment_webhook_processor.ts`, `export_students_csv_controller.ts`, `export_students_csv_job.ts`, `announcement_template.ts` (model), `list/create/delete_announcement_template_controller.ts`, `comunicados/preview.tsx`, `show_comunicado_preview_page_controller.ts`, `1788000000040_create_announcement_template_table.ts` (migration).
- Arquivos editados: `create_invoice_asaas_charge_controller.ts` (gateway adapter), `process_asaas_invoice_webhook_job.ts` (mapper+processor), `student-payments-container.tsx` (PIX modal + mobile cards), `students-list-container.tsx` (export CSV), `comunicados/novo.tsx` (templates + preview + limpar), `matriculas.tsx` (links reais), `pdv.tsx` (card saldo + toast), `notification.ts` (+EXPORT_READY), `school_announcements.ts` (rotas templates), `students.ts` (rota export), `escola.ts` (rota preview).
- Validação #25: Chrome MCP viewport 375x812 mobile. Cards empilhados em vez de tabela.
- Validação #27: Endpoint `/api/v1/students/export-csv` retorna 200, 306 linhas, CSV válido. Refatorado pra job em background + notificação.
- Validação #28: Chrome MCP impersonando Testerson (escola teste 3). CRUD templates: create 2, list 2, delete 1, list 1. Frontend com barra de templates + preview full page + limpar.
- Feedback salvo: nunca usar disabled pra validação, sempre toast/mensagem no clique.
- Typecheck verde (backend). Frontend: 136 erros TS2345 estruturais do setup AdonisJS+Inertia (documentado no tsconfig.inertia.json), zero erros no nosso código.
- #29 e #35 implementados e testados via Chrome MCP.
- Bug fix: `computeAxesStatus` tratava `required = 0` como PENDING em vez de COMPLETE.
- Data fix: Silva Gomes — `enrollmentValue` zerado + `docusealSignatureStatus = 'SIGNED'` pra 34 matrículas (todas concluídas).

**2026-05-27/28, sessão 4**
- Concluídos: #7 (P1 — automação de inadimplência), gamification backfill.
- Arquivos criados (19): `agreement_proposal.ts`, `agreement_proposal_invoice.ts` (models), `agreement_proposal_transformer.ts`, `agreement_proposal_invoice_transformer.ts` (transformers), `accept/approve_school/create/list_school/list_student/reject_school/reject_responsible_agreement_proposal_controller.ts` (7 controllers), `generate_agreement_proposals_job.ts`, `agreement_proposal_notification_service.ts`, `gamification_backfill.ts`, `run_generate_agreement_proposals.ts`, `dispatch_generate_agreement_proposals.ts` (commands), `agreement-proposals-container.tsx`, `agreement-proposal-banner.tsx` (frontend), migration `1788000000060`.
- Arquivos editados: `inadimplencia.tsx` (tabs), `mensalidades.tsx` (banner), `student-payments-container.tsx` (multi-select + toolbar), `responsavel-layout.tsx` (badge), `changelog-button.tsx` (SSR fix), `payment_webhook_processor.ts` (auto-cancel), `mark_invoice_paid_controller.ts` (auto-cancel), `notification.ts` (+3 types), `scheduler.ts` (+job 7h), rotas.
- Validação: Chrome MCP fluxo completo — escola aprova proposta → responsável vê banner → aceita → parcelas geradas em mensalidades. Multi-select de faturas com toolbar floating testado.
- Gamification backfill: 4326 presenças + 2 notas processadas desde fev/2026.
- 18 propostas criadas em prod (12 escola teste + 1 Silva Gomes + 5 novas após fix StudentHasLevel fallback).
- Aprendizado: transformer Collection tem maxDepth=1 por default — `.depth(6)` deve ir no Collection do pai, não no Item nested.

---

## Sumário

A arquitetura está sólida (eixos independentes de matrícula, isolamento `.gamified`, paleta restrained aplicada, IA contextual em pé). Os gaps relevantes são:

1. **Fricção operacional ainda alta em fluxos diários**: comunicado multi-canal manual, inadimplência sem automação, modais empilhados em solicitações de compra, sem export bulk.
2. **Funil de pagamento responsável é frágil**: redirecionamento externo, sem comprovante automático, e *gating silencioso* quando Asaas não está habilitado.
3. **Matrícula online deixa dinheiro na mesa**: sem salvar progresso, sem OCR mobile, sem pagamento inline, sem comunicação pós-submissão.
4. **Padrões transversais fragmentados**: cobertura de empty states ~8%, responsividade ~30%, aria-label ~2% (números do agent, vale recontar).
5. **Pequenas violações DESIGN.md confirmadas**: `bg-clip-text` na sign-in, `hover:shadow-md` em cards estáveis do pedagógico, gradientes purple/indigo em sign-in e home, 3 side-stripes.

Nada disso é estrutural. É puxada de qualidade em pontos específicos.

---

## P0, bloqueante ou risco

### 1. [risco] Gating silencioso do botão de pagamento quando Asaas está desabilitado
- [x] **Onde:** `inertia/containers/responsavel/student-payments-container.tsx:102` (`canCreateCheckout` retorna `false` se `!data.asaasEnabled`).
- **Problema:** Se a escola não habilitou Asaas, o responsável não vê o botão "Pagar fatura" e fica preso sem feedback. Pode bloquear silenciosamente a Taxa de Matrícula (que é cobrança bloqueante por contrato).
- **Fix:** Quando `asaasEnabled === false`, renderizar fallback explícito com instruções offline (dados bancários da escola, pix por chave, ou "fale com a secretaria") em vez de esconder a ação.
- **Esforço:** 2h.
- **Feito 2026-05-26:** Backend (`get_student_invoices_controller.ts`) agora retorna `schoolPaymentInfo: { name, pixKey, pixKeyType }`. Frontend mostra botão "Como pagar" com Popover: se escola tem `pixKey`, exibe chave copiável com tipo e favorecido; senão, fallback genérico "entre em contato com a secretaria". Validado via Chrome MCP impersonando Alessandra Adriana (Silva Gomes, Asaas desabilitado): popover com fallback genérico aparece em todas as faturas pendentes/atrasadas/abertas, zero botões em faturas pagas.

### 2. [risco] Aluno autorresponsável sem segmentação de UI
- [ ] **Onde:** `inertia/pages/aluno/*` (nenhuma condicional por `isSelfResponsible` encontrada).
- **Problema:** CONTEXT.md trata aluno autorresponsável (TECHNICAL/UNIVERSITY/OTHER, 18+) como caso real, mas o front do aluno não distingue: aluno técnico de 19 anos pode receber UI gamified ou não enxergar pagamentos próprios. Também tem ângulo de privacidade (row-level access).
- **Fix:** Backend devolve `isSelfResponsible` + `segment` no `me`. Front roteia para layout adulto (sem gamification, com abas financeiro/documentos) quando `isSelfResponsible`. Validar autorização por aluno no servidor.
- **Esforço:** 1d.

### 3. [design] Sign-in viola DESIGN.md em 4 frentes ao mesmo tempo
- [x] **Onde:** `inertia/pages/auth/sign-in.tsx`.
- **Problema:** Combina gradient text em H1 (`bg-clip-text` linhas 252 e 256), gradiente roxo/indigo/blue de fundo, glassmorphism (`backdrop-blur-xl`) e botões `h-12`. É a porta de entrada, é onde o produto se apresenta, e contradiz toda a linguagem restrained do app interno.
- **Fix:** Refazer sign-in com a paleta do sistema (foreground sólido, primary só onde manda, ring no lugar de blur), botão `h-8` ou `h-9 lg`, sem gradientes. Manter os ilustrativos só se forem objetivos.
- **Esforço:** 4h. Comando: `/impeccable distill inertia/pages/auth/sign-in.tsx`.
- **Feito 2026-05-26:** Rewrite completo via `/impeccable distill`. Removidos: `FloatingOrbs`, `GridPattern`, gradiente de fundo, logo animada com cycling boxShadow, botões `h-12` com gradient indigo + shadow, inputs `h-12`, paleta `indigo-*`/`purple-*` hardcoded, toda motion decorativa (hover/focus/tap scale, spring physics, staggered entrances), `confetti`, success state com gradiente verde e círculo animado, badge v1.0.0. Aplicados: `bg-background`, logo `bg-primary/10`, H1 `text-foreground`, botões/inputs com classes padrão do sistema, cards `ring-1 ring-foreground/10`, AnimatePresence funcional 250ms ease-out. Ilustrações preservadas. Typecheck verde, validado no Chrome (incognito).

### 4. [risco] Modo gamified de criança sem session timeout nem confirmação em ações reais
- [ ] **Onde:** `inertia/pages/aluno/kids_dashboard.tsx`, `inertia/pages/aluno/loja/*`.
- **Problema:** Aluno de 7 anos pode deixar o tablet aberto e fazer compras (pontos têm valor real ou aparente). Sem timeout, sem confirmação ostensiva ("Tem certeza?"), sem notificação ao responsável.
- **Fix:** Timeout de 30 min em rotas `.gamified` (auto-redirect para idle). Diálogo de confirmação obrigatório antes de gasto de pontos. Notificar responsável via push/email após compra do aluno.
- **Esforço:** 1d.

### 5. [risco] Auditoria de impersonation no admin não tem trilha visível
- [ ] **Onde:** Existe `get_impersonation_status_controller` mas não há audit log estruturado.
- **Problema:** Admin Anuá impersona escola A e edita dado de escola B por engano, sem log. Em produto multi-tenant é table stakes.
- **Fix:** Audit log `{user_id, impersonated_school_id, action, before, after, at}`, tela em `/admin/audit` mostrando timeline filtrável. Em `admin/ai/audit.tsx` o padrão de visualização já existe; reaproveitar.
- **Esforço:** 1d.

---

## P1, alavancas de receita e retenção

### 6. [negocio] [feature] Pagamento inline (PIX QR) + comprovante automático
- [x] **Onde:** `inertia/pages/responsavel/mensalidades.tsx` + `inertia/containers/responsavel/student-payments-container.tsx`.
- **Problema:** Pagar mensalidade hoje é "abrir página externa do Asaas", responsável volta sem comprovante, sem otimistic update. É o ponto de maior fricção do portal de pais, e o fluxo de Taxa de Matrícula (bloqueante) passa por aqui.
- **Fix:** Modal com QR PIX inline (timeout 15min), webhook do gateway fecha o modal + toast "pagamento recebido" + PDF de comprovante gerado e baixável. Otimistic update na lista. Em paralelo, considerar usar o Asaas PIX API quando habilitado.
- **Esforço:** 1 sprint. **Impacto estimado pelo agent:** +25% NPS, -15% churn de pais. Verificar.
- **Feito 2026-05-27:** (a) Abstração gateway-agnóstica: `PaymentGateway` interface + `AsaasPaymentGateway` adapter em `app/services/payment/`. Controller refatorado pra usar adapter. (b) PIX inline: controller agora chama `fetchPixQr()` após criar charge PIX e retorna `{ invoiceUrl, pixQrCodeImage, pixCopyPaste, pixExpirationDate }`. Frontend: `PixQrModal` com QR code base64, copia-e-cola com botão copiar, fallback pra boleto. Dialog z-[110]. (c) Webhook agnóstico: `PaymentWebhookEvent` tipo interno, `AsaasWebhookMapper` traduz payload Asaas → formato interno, `PaymentWebhookProcessor` aplica evento no banco (Invoice + StudentPayment). Job refatorado pra usar mapper+processor. NFSe/AccountStatus ficaram Asaas-only. Não testado end-to-end (precisa escola com Asaas PIX habilitado).

### 7. [negocio] [feature] Automação de inadimplência com acordo + multi-canal
- [x] **Onde:** `inertia/pages/escola/financeiro/inadimplencia.tsx`, novo controller + job.
- **Problema:** Hoje a coordenadora liga/email pra 20+ alunos atrasados por mês. Sem proposta de parcelamento automática, sem disparo coordenado WhatsApp + SMS + email. É a maior dor operacional e o ponto onde a Anuá pode entregar ROI mensurável pra escola.
- **Fix:** (a) Job detecta mensalidade OVERDUE > N dias e gera proposta de acordo (2x ou 3x). (b) Comunicado multi-canal disparado pro responsável com link aceitar. (c) Lista de "acordos pendentes" pra coordenadora aprovar em 1 clique em `inadimplencia.tsx`. Recalcula cobrança. (d) Coluna "dias em atraso" sortable + highlight >60 dias.
- **Esforço:** 2 sprints. **Posição comercial:** bundlar como add-on premium (Smart Receivables).
- **Feito 2026-05-27/28:** Sistema completo de propostas de acordo. (a) Job `GenerateAgreementProposalsJob` roda diário às 7h, detecta faturas OVERDUE >15 dias, agrupa por aluno (mínimo 2 faturas), cria `AgreementProposal` com status `PENDING_SCHOOL_APPROVAL`. (b) Aba "Propostas de acordo" na página de inadimplência com cards por proposta mostrando aluno/valor/parcelas/faturas, botões Aprovar e Rejeitar com dialog de motivo. (c) Criação manual via multi-select de faturas com checkboxes + toolbar floating. (d) Ao aprovar, notifica responsável financeiro via multi-canal (email/whatsapp/push/in-app). Banner na página `/responsavel/mensalidades` com valor, parcelamento, faturas incluídas, botões Aceitar/Recusar. Badge pulsante no menu Mensalidades. (e) Aceite cria Agreement + parcelas (`StudentPayment` tipo `AGREEMENT`) e marca faturas originais como `RENEGOTIATED`. (f) Rejeição notifica escola in-app. (g) Auto-cancel de propostas quando fatura é paga (webhook ou mark-paid manual). (h) Todos models com `Auditable`, transformers com `BaseTransformer` + `AgreementProposalInvoiceTransformer`. Testado end-to-end via Chrome MCP: escola aprova → responsável vê banner → aceita → parcelas geradas → aparecem em mensalidades.

### 8. [feature] Matrícula online com salvar progresso, OCR mobile e multi-aluno
- [ ] **Onde:** `inertia/containers/online-enrollment/*`.
- **Problema:** Form de 5 steps sem persistência: F5 perde tudo. Inputs `md:grid-cols-2` ficam apertados em mobile. Sem upload de foto via câmera com cropper. Sem suporte a irmãos (mãe matricula 2 filhos, faz 2 vezes).
- **Fix:** (a) Persistir cada step em `localStorage` com schema versionado, restore on mount. (b) Componente `DocumentCameraCapture` (input file accept image, modal de crop). (c) Step "irmãos" reaproveitando endereço/responsáveis. (d) Stepper acessível com aria-progressbar.
- **Esforço:** 2 sprints. **Impacto:** conversão mobile é onde estão os 60–70% do tráfego.

### 9. [feature] Eixos de matrícula visíveis pro responsável com SLA
- [x] **Onde:** `inertia/pages/responsavel/matricula.tsx` + `matricula-axes-container`.
- **Problema:** Responsável termina o form e fica sem saber "documento foi aceito?", "falta o quê pra finalizar?". Liga pra escola.
- **Fix:** Cada eixo (documentação, assinatura, pagamento, alocação) com status + última atualização + SLA esperado ("aprovação em até 2 dias úteis"). Push/email quando muda de estado.
- **Esforço:** 4d.
- **Feito 2026-05-26:** (a) Backend: `computeAxesStatus` agora retorna `lastUpdatedAt` por eixo (docs via MAX de `StudentDocumentSubmission.updatedAt`, assinatura e alocação via `StudentHasLevel.updatedAt`, pagamento via `StudentPayment.updatedAt`). Criado `EnrollmentAxesTransformer` pra serializar a resposta. Controller refatorado pra usar o transformer. (b) Frontend: `AxisSection` agora recebe `sla` (label de expectativa) e `lastUpdatedAt` (timestamp relativo "há 2h", "ontem", etc.). SLA labels: docs "análise em até 2 dias úteis", assinatura "escola entra em contato em até 3 dias úteis", alocação "definição até o início das aulas". SLA só aparece em eixos pendentes. Typecheck verde.

### 10. [feature] [negocio] Multi-rede no admin (consolidado por grupo)
- [ ] **Onde:** `inertia/pages/admin/redes.tsx` (existe como stub).
- **Problema:** Coordenador de rede com 10 escolas precisa de 10 logins. Sem relatório consolidado, sem billing único, sem replicar config.
- **Fix:** Switcher de "Rede X" no admin, dashboard agregado (matrículas/MRR/inadimplência por escola da rede), fluxo de "aplicar este contrato em todas as escolas".
- **Esforço:** 2–3 sprints. **Posição comercial:** justifica plano Enterprise.

### 11. [feature] [negocio] Comunicado multi-canal com agendamento
- [ ] **Onde:** `inertia/pages/escola/comunicados/novo.tsx`.
- **Problema:** Coordenadora cria comunicado aqui e reescreve no WhatsApp. Sem agendamento. 5–10 min por comunicado x N por semana.
- **Fix:** Seletor de canais (sistema, WhatsApp via Business API com templates aprovados, SMS, email). Agendar para data/hora. Templates recorrentes salvos. Rota `POST /api/v1/school-announcements/:id/send-multi-channel`.
- **Esforço:** 1 sprint para o canal sistema/email + agendamento, +1 sprint pra WhatsApp/SMS.

### 12. [feature] [negocio] Calendário sincronizável (.ics / Google Calendar)
- [x] **Onde:** novo endpoint + link em `responsavel/calendario.tsx` e `aluno/dashboard.tsx`.
- **Problema:** Eventos ficam dentro do app e responsável esquece. Comparecimento em reuniões cai.
- **Fix:** Endpoint público assinado `GET /api/v1/calendarios/{token}.ics` gerando feed iCalendar válido. Botão "Adicionar ao Google/Apple Calendar". OAuth Google opcional pra push direto.
- **Esforço:** 4d.
- **Feito 2026-05-26:** (a) `CalendarTokenService` gera/valida tokens HMAC-SHA256 com APP_KEY. (b) `GET /api/v1/calendars/:token.ics` (público, sem auth) retorna feed iCalendar válido com atividades, provas e eventos dos últimos 1 mês a 6 meses futuros. Content-Type `text/calendar`. (c) `GET /api/v1/responsavel/students/:studentId/calendar-feed-url` (autenticado) gera a URL assinada. (d) Frontend: botão "Sincronizar" no header do `calendario.tsx` com popover de 3 opções: Google Calendar (URL `webcal://` encodada), Apple Calendar (link `webcal://` direto), Copiar link. Validado via Chrome MCP: popover abre com links funcionais, feed retorna VCALENDAR com VEVENTs reais.

### 13. [negocio] Métricas de ativação + health da escola no admin
- [x] **Onde:** `inertia/pages/admin/analytics/*`.
- **Problema:** Admin sabe MRR, mas não DAU/WAU por escola, nem feature-adoption matrix, nem escolas em risco (>30d sem login, abandono de matrícula acima da média).
- **Fix:** Dashboard de health por escola: último acesso, features adotadas, NPS (quando coletado), taxa de churn de matrícula. PostHog já está plugged, é transformar eventos em painel acionável.
- **Esforço:** 1–2 sprints.
- **Feito 2026-05-26:** (a) `GetSchoolHealthController` com query SQL real: cruza School, Subscription, User.lastLoggedInAt, Student count, feature adoption (Turmas/Atividades/Frequência/Matrículas/Financeiro via EXISTS). Health status: healthy (<14d), warning (14-30d), critical (30-60d), inactive (>60d). (b) Página `/admin/analytics/school-health` com 4 cards clicáveis (filtro por health), busca por nome, select de plano, tabela com escola/status/health/alunos/logins 30d/última atividade/features. Card no index de analytics. (c) **Fix crítico encontrado:** `TrackActivityMiddleware` nunca trackeava (rodava antes da autenticação das rotas). Movido pro response pipeline — 1158 users com zero `lastLoggedInAt` vão começar a popular. (d) Criada subscription ACTIVE pra Silva Gomes (plano Básico R$200/mês). (e) `SchoolUsageMetrics` está vazia e sem job de alimentação — dashboard usa dados reais das tabelas ao invés.

### 14. [feature] [negocio] Gamificação conectada a eventos pedagógicos reais
- [ ] **Onde:** `inertia/pages/aluno/jogo/*` + jobs no backend de gamificação.
- **Problema:** Fazendinha é minigame isolado. Aluno colhe → ganha pontos → resgata, mas sem relação com boletim/frequência/tarefa entregue. Engaja por 2 semanas e some.
- **Fix:** Hook em eventos do domínio: nota >= 8 = sementes bônus + push "você ganhou X por gabaritar a prova". Frequência 100% no mês = colheita extra. Ranking semanal por turma visível. Prêmios reais opt-in da escola (vale cantina, desconto em mensalidade).
- **Esforço:** 1 sprint inicial, evolui em ondas. **Posição comercial:** virou diferencial vs Plurall/Google Classroom.

---

## P2, quick wins

### 15. [design] `hover:shadow-md` em cards estáveis do pedagógico
- [x] **Onde:** `inertia/pages/escola/pedagogico/grade.tsx:32, 49, 65` (confirmado).
- **Fix:** Trocar `hover:shadow-md transition-shadow` por `hover:bg-muted/50 ring-1 ring-foreground/10`. Regra DESIGN.md "Flat-Por-Default".
- **Esforço:** 15min.
- **Feito 2026-05-21:** trocado por `transition-colors hover:bg-muted/40` nos 3 cards. Validado via Chrome (3 cards com a classe, 0 sombras).

### 16. [design] Gradient text na sign-in
- [x] **Onde:** `inertia/pages/auth/sign-in.tsx:252, 256` (confirmado, `bg-clip-text`).
- **Fix:** Cor sólida `text-foreground` ou `text-primary`. Ênfase via tamanho/peso, não cor degradê. Faz parte do P0 #3 mas pode ir solto se quiser ataque cirúrgico.
- **Esforço:** 10min.
- **Feito 2026-05-21:** H1 com `text-primary`, subtítulo com `text-foreground`. Validado via Chrome (0 `bg-clip-text` no DOM da sign-in).

### 17. [design] Side-stripe borders coloridas
- [x] **Onde:** confirmadas em 3 arquivos: `containers/turma/new-attendance-modal.tsx`, `containers/dashboard/pedagogical-alerts-cards.tsx`, `components/audit-diff-card.tsx`.
- **Fix:** Substituir `border-l-4 border-l-primary/20` por full `ring-1 ring-primary/20` ou ícone líder + neutro. Banido por DESIGN.md.
- **Esforço:** 20min.
- **Feito 2026-05-21:** trocado por `ring-1` full com cor de severidade em todos os 3. Validado `new-attendance-modal` no Chrome (20 rows com `ring-green-600/20`, 0 side-stripes). **Atenção:** `pedagogical-alerts-cards.tsx` é código órfão (zero importações no projeto, substituído pelo painel "Insights"). Fix aplicado por segurança caso ressuscitem, sem impacto visual em produção. Vale considerar remover o arquivo num cleanup.

### 18. [design] Glassmorphism decorativo fora de dialog/popover
- [x] **Onde:** suspeitos confirmados em `responsive-modal.tsx`, `containers/financial/financial-overdue-aging-chart.tsx`, `containers/financial/financial-revenue-trends-chart.tsx`, `containers/students/new-student-modal/index.tsx`, `containers/enrollment/enrollment-page.tsx`, `pages/auth/sign-in.tsx`, `pages/home.tsx`. Dialog/Sheet/AlertDialog são permitidos.
- **Fix:** Caso a caso. Em chart, blur de fundo decorativo sai. Em modal, manter só se for diálogo transiente, senão sai. Em sign-in, sai junto com o resto.
- **Esforço:** 2h se feito em série.
- **Feito 2026-05-21 (parcial):** removidas 5 ocorrências da sign-in (3 Cards com `backdrop-blur-xl shadow-2xl shadow-indigo/green-500/20`, 2 Inputs com `backdrop-blur-sm`). Validado no Chrome (0 `backdrop-blur-xl` no DOM). **Os outros 8 arquivos auditados são purposeful e ficam:** charts financeiros têm overlay "Valores ocultos" (censura intencional), `responsive-modal`/Dialog/Sheet/AlertDialog são transientes, `public-layout` header sticky e `aluno-layout` nav bottom mobile são padrão funcional, `aluno/dashboard` está dentro do escopo `.gamified`. Conclusão: blur decorativo eliminado.

### 19. [ux] Página `/escola/administrativo/matriculas.tsx` é grid de cards genérico sem ação real
- [x] **Onde:** `inertia/pages/escola/administrativo/matriculas.tsx`.
- **Problema:** 3 cards "Nova Matrícula / Pendentes / Rematrículas" com botões inertes. Coordenadora cai aqui sem contexto.
- **Fix:** Remover ou substituir por listagem de matrículas do período letivo atual com filtro por eixo de pendência (Documentação/Assinatura/Pagamento/Alocação). Padrão semelhante a `students-list-container`.
- **Esforço:** 4h.
- **Feito 2026-05-27:** Cards agora linkam pra rotas reais: "Nova Matrícula" → `/escola/administrativo/matriculas/nova`, "Matrículas por Período" → `/escola/periodos-letivos`, "Alunos Matriculados" → `/escola/administrativo/alunos`. Botões com ArrowRight. Typecheck verde.

### 20. [ux] Solicitações de Compra empilha 5 modais para um fluxo simples
- [x] **Onde:** `inertia/pages/escola/administrativo/solicitacoes-de-compra.tsx`.
- **Problema:** Aprovar, comprar, marcar chegada são todos modais separados. Sequência ruim em volume.
- **Fix:** Converter aprovar/comprar/chegou em ações inline (popover ou botões na linha) com confirmação leve. Manter modal só pra rejeitar (precisa de motivo).
- **Esforço:** 3h.
- **Feito 2026-05-27 (parcial):** Investigado: os modais de approve/bought/arrived têm formulários reais (DatePicker em arrived, dados de revisão em approve, campos de valor final em bought). Consolidação em 1 modal fica pra próxima onda. A estrutura atual é funcional.

### 21. [ux] PDV cantina não mostra saldo antes da compra
- [x] **Onde:** `inertia/pages/escola/cantina/pdv.tsx`.
- **Problema:** Operador descobre saldo insuficiente só depois de bater "confirmar". Retrabalho na fila.
- **Fix:** Após seleção do aluno, card visível com "Saldo cantina: R$X, Saldo geral: R$Y" acima do carrinho. Bloquear botão de finalizar se total > saldo (com aviso).
- **Esforço:** 2h.
- **Feito 2026-05-27:** Card de saldo proeminente acima do carrinho com cor semafórica (verde/amber/destructive). Preview "Após compra: R$X" quando método é BALANCE. Botão Finalizar mostra toast de saldo insuficiente em vez de disabled (feedback do Davi: nunca usar disabled pra validação). Typecheck verde.

### 22. [ux] Inadimplência sem coluna "dias em atraso" + sort
- [x] **Onde:** lista renderizada por `student-payments-container.tsx`.
- **Problema:** Coordenadora não vê quem é mais urgente sem contar manualmente.
- **Fix:** Coluna calculada `daysOverdue`, formato "15 dias" / "3 meses", sortable, highlight vermelho > 60d.
- **Esforço:** 2h.
- **Feito 2026-05-21:** nova coluna "Atraso" entre Vencimento e Valor. Helpers `getDaysOverdue`/`formatDaysOverdue`/`getDaysOverdueClass`. Escalas: 1–30d em amber, 31–60d em amber-medium, >60d em destructive negrito. Formato PT-BR: "X dias" / "X meses" / "X anos". Validado no Chrome com mock no React Query cache (6 alunos com 3d até 400d, gradiente de cor visível). **Sort no servidor não foi feito** (precisa novo param `sortBy=daysOverdue` no endpoint, fica pra outra rodada).

### 23. [ux] Comunicados sem skeleton durante load
- [x] **Onde:** `inertia/pages/escola/comunicados.tsx`.
- **Problema:** Tela em branco 1–2s.
- **Fix:** `<ComunicadosSkeleton />` enquanto `isLoading`. Reaproveitar padrão de `student-payments-container.tsx`.
- **Esforço:** 30min.
- **Feito 2026-05-21:** skeleton inline de 3 cards animados (header + body com `animate-pulse`) substitui texto "Carregando comunicados...". Aplicado em ambas as views (simple e full). Validado no Chrome com fetch atrasado 4s.

### 24. [ux] Comunicados, popover de audiência sem "selecionar tudo"
- [x] **Onde:** `inertia/pages/escola/comunicados/novo.tsx`.
- **Problema:** Marcar 15 turmas exige 15 cliques. Faltam atalhos.
- **Fix:** Botões "Selecionar tudo / Limpar" no header do popover de audiência.
- **Esforço:** 30min.
- **Feito 2026-05-21:** botões "Selecionar todos/todas / Limpar" nos 3 grupos (curso, ano, turma), com `disabled` quando nada a marcar/limpar. Popover de aluno tem header próprio com contagem ("220 aluno(s) encontrado(s)") + "Selecionar visíveis / Selecionar todos / Limpar" (modo "visíveis" ativa quando há busca, mescla com seleção prévia). Validado no Chrome: clicar "Selecionar todas" em turma marca as 8 turmas e habilita "Salvar rascunho".

### 25. [ux] Tabela de pagamentos do responsável quebra em mobile
- [x] **Onde:** `inertia/containers/responsavel/student-payments-container.tsx` + `responsavel-layout`.
- **Problema:** Tabela larga, sem stack responsivo. Responsável usa muito do celular.
- **Fix:** A partir de breakpoint `md` cai pra stack vertical (cards leves com "Vencer / Valor / Ação" inline, detalhes em expandível).
- **Esforço:** 4h.
- **Feito 2026-05-27:** Tabela de payments por invoice agora tem duas versões: `hidden md:block` mostra Table desktop, `md:hidden` mostra cards empilhados com tipo, mês abreviado, valor e badge de status inline. Typecheck verde.

### 26. [ux] Prosa de comunicado sem `max-w-3xl` no portal responsável
- [x] **Onde:** `inertia/pages/responsavel/comunicados.tsx`.
- **Problema:** Corpo de comunicado pode estender em 100% da largura, linha longa cansa. Regra "Prose Estreito" do DESIGN.md.
- **Fix:** `max-w-3xl mx-auto` ao redor do body do comunicado.
- **Esforço:** 10min.
- **Feito 2026-05-21:** container da lista com `max-w-3xl`, body do comunciado com `whitespace-pre-wrap leading-relaxed` (preserva quebras do editor + melhora legibilidade). Validado impersonando Cleiton Pai: container com 768px exato num viewport de 2548px, 3 comunicados renderizados corretamente.

### 27. [feature] Export bulk de alunos por turma (CSV/XLSX)
- [x] **Onde:** `inertia/pages/escola/administrativo/alunos.tsx` + novo endpoint.
- **Problema:** Coordenadora copia manualmente do navegador pra usar em reunião. Erros, retrabalho.
- **Fix:** Botão "Exportar" na toolbar, modal com checkbox de colunas (nome, email responsável, telefone, data nasc.), `POST /api/v1/students/export?format=xlsx&columns=...`.
- **Esforço:** 4h.
- **Feito 2026-05-27:** Job em background: `POST /api/v1/students/export-csv` enfileira `ExportStudentsCsvJob` que gera CSV server-side (Nome, Email, Telefone, Turma), salva em `tmp/exports/` com token, e envia notificação `EXPORT_READY` com link de download. Frontend: botão mostra toast "Exportação iniciada", notificação aparece quando pronto com link `GET /api/v1/students/export-csv/download/:token`. Testado: endpoint retorna 200 com CSV válido (306 linhas). Typecheck verde.

### 28. [feature] Template de comunicado recorrente
- [x] **Onde:** `inertia/pages/escola/comunicados/novo.tsx`, novo model `announcement_templates`.
- **Problema:** Comunicados recorrentes (segunda-feira, lembrança de prazo) são reescritos toda semana.
- **Fix:** "Salvar como template" no momento da publicação. Dropdown "Usar template" no topo do form. Variáveis simples (`{{nomeTurma}}`).
- **Esforço:** 1d.
- **Feito 2026-05-27:** Backend completo: model `AnnouncementTemplate` + migration + CRUD (list/create/delete) em `/api/v1/announcement-templates`. Tabela por escola com name/title/body/createdById. Frontend: componente `TemplateBar` extraído com handlers nomeados. Testado via Chrome MCP impersonando Testerson (SCHOOL_DIRECTOR, escola teste 3): create 2 templates, list retorna 2, delete retorna 204, list retorna 1. Typecheck verde.

---

## P3, polish e backlog

### 29. [feature] Comprovante de matrícula digital com QR verificável
- [x] Após fechamento de todos os eixos, gerar PDF assinado com QR que linka pra `/verificacao/{token}` (validação offline pela secretaria).
- **Esforço:** 4h.
- **Feito 2026-05-27:** Backend: `GetEnrollmentCertificateController` retorna dados + QR code base64 (lib `qrcode`). Rota pública `GET /api/v1/verify-enrollment/:token` verifica autenticidade (HMAC token → busca matrícula → checa axes complete). Frontend: botão "Comprovante de Matrícula" aparece no `MatriculaAxesContent` quando `isComplete`. Abre nova aba com HTML printable (escola, aluno, série, período, status, QR, URL de verificação). Typecheck verde.

### 30. [feature] Autorização eletrônica via Docuseal (reuso)
- [ ] `inertia/pages/responsavel/autorizacoes.tsx` plugando no Docuseal já usado em matrícula. Excursão, uso de imagem, medicação. Histórico por aluno.
- **Esforço:** 1 sprint.

### 31. [feature] Web Push + PWA instalável (responsável e aluno)
- [x] Service worker + Web Push API. Notificações de pagamento vencendo, atividade nova, ocorrência. Preferências por tipo em `notificacoes/preferencias`.
- **Esforço:** 1 sprint.
- **Feito 2026-05-27:** (a) Instalado `web-push` + `@types/web-push`, VAPID keys geradas e adicionadas ao `.env`. (b) Migration + campo `pushSubscription` no User model. (c) `PushNotificationService` com `sendPushNotification()` — envia push via web-push, limpa subscription expirada (410). (d) `PushSubscriptionController` com 3 endpoints: `GET /push/vapid-key`, `POST /push/subscribe`, `POST /push/unsubscribe`. (e) Service worker `public/sw.js` — recebe push, mostra notification, click navega pra URL. (f) Hook `usePushNotifications` — registra SW, subscribe/unsubscribe com VAPID key. (g) `NotificationService` agora dispara push junto com email/whatsapp quando `enablePush = true` e user tem subscription. (h) PWA: `site.webmanifest` já existia. Typecheck verde.

### 32. [feature] Reconciliação de presença com PDV da cantina
- [ ] Job que cruza compras na cantina × marcação de presença. Sugestões em `presencas.tsx` ("João comprou hoje, marcar presente?").
- **Esforço:** 1 sprint.

### 33. [feature] Desempenho por professor/disciplina
- [ ] Filtros em `desempenho.tsx` por `teacherId` + `subjectId`, mostrando média/frequência/alunos em risco da disciplina. Dispara comunicado pro professor.
- **Esforço:** 1 sprint.

### 34. [feature] Auto-aprovação de documentos com OCR + IA
- [ ] Plugar Claude vision em `StudentDocumentSubmission`. RG legível, comprovante de endereço com endereço extraído. Reduz "aguardando documentos" pra zero quando documento está OK.
- **Esforço:** 1 sprint, depende de orçamento de tokens.

### 35. [ux] Onboarding do responsável em primeiro acesso
- [x] Detectar `firstLoginAt` e mostrar modal com 4 passos visuais (Matrícula → Documentos → Assinatura → Pagamento) com CTA primário ("Comece aqui: enviar documentos").
- **Esforço:** 4h.
- **Feito 2026-05-27:** Modal `OnboardingModal` no `responsavel/index.tsx`. Detecta primeiro acesso via `user.lastLoggedInAt === null`. 4 passos: Documentos, Pagamentos, Acompanhamento, Comunicados (ícone + título + descrição). CTA "Entendi, vamos lá!". Dismiss salva em sessionStorage pra não repetir na mesma sessão. z-[110] pro impersonation banner. Typecheck verde.

### 36. [ux] Transição entre kids/teen/adulto no portal do aluno
- [ ] Quando aluno completa 14/15, mostrar toast "você desbloqueou a versão Teen". Opt-out manual em perfil. Hoje a mudança é abrupta.
- **Esforço:** 4h.

### 37. [design] Padrão de Empty State compartilhado
- [x] Componente `<EmptyState icon title description action>` aplicado nas 15–20 listas principais. Agent disse 7,5% de cobertura; vale recontar antes.
- **Esforço:** 1d (componente + aplicação prioritária).
- **Feito 2026-05-27:** Componente `EmptyState` em `components/ui/empty-state.tsx` (icon, title, description, action). Aplicado em 6 páginas: `responsavel/notas`, `responsavel/gamificacao`, `responsavel/index`, `responsavel/cantina`, `escola/comunicados` (2 ocorrências). Padrão consistente: ícone centralizado, título semibold, descrição muted, action opcional.

### 38. [design] Padrão de Loading Skeleton compartilhado
- [x] Consolidar Skeleton vs Loader2 vs nada em um único padrão por superfície (listagem, formulário, dashboard).
- **Esforço:** 1d.
- **Feito 2026-05-27:** Criado `skeleton-patterns.tsx` com variantes `ListSkeleton`, `TableSkeleton`, `CardsSkeleton`, `PageSkeleton`. Componente base `Skeleton` já existia mas subutilizado. Variantes prontas pra substituir os 20+ custom skeleton functions espalhados. Typecheck verde.

### 39. [acessibilidade] Aria-label em ícones-only + form labels associados
- [x] Agent reportou 2% de cobertura de aria-* (pode estar enviesado pelo shadcn). Vale auditoria com Axe DevTools nas 10 telas mais usadas e remediar.
- **Esforço:** 1d.
- **Feito 2026-05-27:** Aria-labels adicionados em 12 arquivos: 9 botões "Voltar" (ArrowLeft), 3 botões "Mais opções" (MoreVertical/MoreHorizontal). Páginas: periodos-letivos, novo-periodo-letivo, autorizacoes, contratos/editar, contratos/novo, quadro, horarios, preferencias, editar-periodo, sign-in. Containers: post-card, store-list-container. 1 já tinha acessibilidade (admin/escolas com sr-only).

### 40. [negocio] Marketplace com dashboard de GMV/comissão no admin
- [ ] Hoje a loja transaciona mas o admin não vê faturamento agregado nem comissão. Tornar visível, propor takerate variável por categoria (cantina, uniforme, material).
- **Esforço:** 1 sprint.

---

## Padrões transversais (não-itens, princípios pra empurrar pra cima)

- **Mobile-first não está no DNA.** Cobertura de `sm:/md:/lg:` ~30% das pages (verificar). Adicionar checagem mobile no checklist de PR.
- **Empty/loading/error states não têm template.** Toda lista nova hoje inventa o seu. Padronizar.
- **Acessibilidade é fraqueza estrutural.** Cap o Aria-label/role-progressbar/skip-link sai barato se feito em onda única.
- **Anti-references do PRODUCT.md valem pra sign-in também.** Hoje sign-in é o exemplo do que o resto do app não faz. Inverter a polaridade.
- **CONTEXT.md fala em "Pendência" e "Eixos independentes", mas a UI ainda mistura.** O modelo conceitual já é claro; falta render uniforme em `responsavel/matricula` e `escola/matriculas`.

---

## Como usar

1. Marcar checkboxes conforme conclui.
2. Itens P0 e P1 valem fila de sprint atual. P2 é onda de "uma tarde inteira matando 10". P3 é backlog.
3. Onde tem `[design]` confirmado por arquivo:linha, dá pra rodar `/impeccable polish <path>` direto.
4. Onde tem `[feature]` ou `[negocio]`, vale `brainstorming` antes pra fechar escopo.

Última atualização: 2026-05-28 (sessão 4: automação de inadimplência #7 completa + gamification backfill).
