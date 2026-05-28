# Melhorias & Análise Competitiva — Anuá v2, Junho 2026

Documento de melhorias organizado por módulo funcional. Cada módulo tem três camadas:
- **Polish** — pequenos detalhes de UX, labels, estados, micro-interações
- **Evolução** — melhorias em funcionalidades que já existem
- **Competitivo** — features que concorrentes têm e a Anuá não, ou oportunidades de diferenciação

**Legenda de esforço:** `[XS]` < 2h, `[S]` 2h–1d, `[M]` 1–3d, `[L]` 1 sprint, `[XL]` 2+ sprints.
**Legenda de prioridade:** `P0` bloqueante/risco, `P1` alto impacto, `P2` médio, `P3` backlog.
**Concorrentes mencionados:** Sponte, Isaac/Meu Arco, Escola em Movimento (EeM), iScholar, ClassApp, Eduqo, Lyceum, Proesc, SophiA, Agenda Edu, Diário Escola (BR) | PowerSchool, Alma, ManageBac, Blackbaud, Veracross, ClassDojo, Bloomz, Classter, SchoolMint, Toddle, Transparent Classroom (INT).

**Fontes:** auditoria do codebase (controllers, pages, services, models), pesquisa de features dos concorrentes (sites, docs, reviews), AUDITORIA-2026-05.md (itens abertos referenciados mas não duplicados).

**⚠ Nota sobre falsos positivos:** A auditoria inicial flaggeou várias páginas como "shells vazios" baseando-se no tamanho em bytes do arquivo `.tsx`. Isso é incorreto — o pattern do codebase é Page = shell fino (header + delegação) → Container faz o trabalho real. Items marcados `FALSO POSITIVO` foram verificados e descartados.

---

## 1. Matrícula & Rematrícula

### Polish

#### 1.1 ~~Stepper de matrícula online sem aria-progressbar~~ `P2` `[XS]` FEITO (testado)
- [x] **Onde:** `inertia/components/ui/stepper.tsx` (componente compartilhado, usado em 5+ lugares incluindo matrícula online, contratos, eventos, períodos letivos, Asaas onboarding).
- **Problema:** Stepper visual já tinha `aria-current="step"` mas faltava `role="progressbar"` com valores numéricos pra leitores de tela.
- **Fix:** Adicionado `<div role="progressbar">` com `aria-valuenow`, `aria-valuemin=1`, `aria-valuemax={steps.length}` e `aria-valuetext` em português ("Passo X de N: {título}"). Visualmente oculto via `sr-only`. Como é componente compartilhado, o fix beneficia todos os steppers do app.
- **Validado 2026-05-28:** Typecheck verde, componente compartilhado renderiza em múltiplas páginas que usam `Stepper`.

#### 1.2 ~~Labels de campos não seguem vocabulário do CONTEXT.md~~ `P3` `[XS]` FEITO
- [x] **Onde:** `inertia/pages/escola/index.tsx:304`
- **Problema:** Quick action "Matrículas e cadastros" usava termo proibido pelo CONTEXT.md.
- **Fix:** Auditoria completa: zero ocorrências de "Inscrição". Única ocorrência de "cadastros" (quick action no dashboard escola) corrigida para "Matrículas e alunos".

#### 1.3 ~~Página `/escola/administrativo/matriculas.tsx` sem empty state informativo~~ `P3` `[XS]` FEITO
- [x] **Onde:** `inertia/pages/escola/administrativo/matriculas.tsx` + `app/controllers/pages/escola/show_matriculas_page_controller.ts`
- **Problema:** Quando não há período letivo ativo, coordenadora via cards de navegação sem contexto.
- **Fix:** Controller agora consulta `AcademicPeriod` e passa `hasActivePeriod`. Quando false, renderiza `EmptyState` com ícone `CalendarPlus`, mensagem "Nenhum período letivo ativo" e CTA "Configurar período letivo" linkando pra períodos letivos.

### Evolução

#### 1.4 Matrícula online sem persistência de progresso `P1` `[M]`
- **Onde:** `inertia/pages/matricula-online/index.tsx`
- **Problema:** F5 perde todos os dados. Responsável preenchendo pelo celular (60-70% do tráfego) perde tudo se trocar de app.
- **Fix:** Persistir cada step em `localStorage` com schema versionado. Restore on mount. Expirar após 7 dias.
- **Ref:** AUDITORIA-2026-05 #8.

#### 1.5 Rematrícula sem fluxo dedicado `P1` `[L]`
- **Onde:** Não existe. Hoje a escola cria matrícula nova manualmente.
- **Problema:** Escola com 300 alunos gasta 2+ dias rematriculando um a um. Sem comunicação automática pro responsável.
- **Fix:** Fluxo de rematrícula em massa: selecionar turma/período → gerar rematrículas pendentes → notificar responsáveis com link de confirmação/pagamento. Responsável confirma dados, assina contrato e paga taxa pelo portal.
- **Quem tem:** Sponte, Isaac, iScholar, Lyceum, Proesc, SophiA, OpenApply ("re-enrol in minutes").

#### 1.6 Upload de documento sem captura por câmera `P2` `[S]`
- **Onde:** fluxo de envio de documentos no portal do responsável.
- **Problema:** Mobile é maioria. Input `type=file` abre galeria. Sem crop, sem orientação de "tire foto do RG frente/verso".
- **Fix:** Componente `DocumentCameraCapture` com input file accept image + modal de crop + guia de enquadramento.

#### 1.7 Matrícula sem suporte a irmãos (multi-aluno) `P2` `[M]`
- **Onde:** `inertia/pages/matricula-online/index.tsx`
- **Problema:** Mãe com 2 filhos repete o form inteiro: endereço, responsáveis, tudo duplicado.
- **Fix:** Step "Deseja matricular outro filho?" ao final, reaproveitando endereço e responsáveis. Agrupar na tela da escola.
- **Quem tem:** SchoolMint (MultApply), OpenApply.

#### 1.8 SLA de eixos sem notificação push/email ao mudar de estado `P2` `[S]`
- **Onde:** `inertia/containers/online-enrollment/matricula-axes-container.tsx`
- **Problema:** Eixos de matrícula (docs, assinatura, pagamento, alocação) mudam de estado e o responsável só descobre se abrir o portal.
- **Fix:** Notificar por push/email quando eixo muda (ex: "Documentos aprovados", "Assinatura pendente"). Usar `NotificationService` já existente.

### Competitivo

#### 1.9 CRM de captação com funil de matrícula `P1` `[XL]`
- **Problema:** Escola não sabe quantos leads visitaram a página, quantos iniciaram form, quantos desistiram em qual step. Sem follow-up automatizado.
- **Fix:** Funil visual: Visita → Início → Step N → Submetido → Matriculado. Integrar com PostHog (já plugado). Disparar email/WhatsApp automático para quem abandonou no step 3+.
- **Quem tem:** Sponte (CRM com SMS/email marketing), Isaac (analytics de matrícula), Lyceum (chatbot captou 48K leads), Proesc ("Máquina de Matrículas"), SchoolMint (CRM completo), Blackbaud (self-scheduling tours).

#### 1.10 Previsão de matrícula com IA `P3` `[L]`
- **Problema:** Escola planeja vagas e orçamento no escuro. Não sabe quantas matrículas esperar no próximo período.
- **Fix:** Modelo preditivo baseado em histórico de matrículas, sazonalidade, taxa de rematrícula. Dashboard com projeção e cenários.
- **Quem tem:** PowerSchool (Predictive Enrollment), FACTS IQ (admissions yield predictions).

#### 1.11 Waitlist / lista de espera com loteria `P3` `[M]`
- **Problema:** Turma lotou, não tem como o responsável entrar em fila. Escola gerencia por planilha.
- **Fix:** Botão "Entrar na lista de espera" quando turma está cheia. Notificação automática quando vaga abre. Opcional: sorteio justo para escolas com demanda alta.
- **Quem tem:** SchoolMint (sistema de loteria completo), Blackbaud, OpenApply, Classter.

#### 1.12 Tour/visita agendável pelo site `P3` `[S]`
- **Problema:** Família interessada liga pra escola pra marcar visita. Fricção.
- **Fix:** Widget de agendamento de visita no link público de matrícula. Calendly-like com horários disponíveis da secretaria.
- **Quem tem:** Blackbaud (self-scheduling campus tours).

---

## 2. Financeiro & Cobranças

### Polish

#### 2.1 ~~Faturas sem indicador visual de método de pagamento~~ `P3` `[XS]` FEITO (testado)
- [x] **Onde:** `inertia/containers/student-payments-container.tsx`, `app/transformers/student_payment_transformer.ts`, `app/controllers/student_payments/list_student_payments_controller.ts`
- **Problema:** Lista de faturas não mostrava ícone do método (PIX, boleto, cartão).
- **Fix:** Controller preloads `invoice`. Transformer expõe `invoicePaymentMethod`. Frontend: componente `PaymentMethodBadge` com ícone+label por método (QrCode/PIX, Landmark/Boleto, CreditCard/Cartão, Banknote/Dinheiro). Coluna "Método" adicionada à tabela.
- **Validado 2026-05-28:** Chrome MCP impersonando Testerson (escola teste completo 3). Coluna "Método" visível na tabela de inadimplência exibindo `-` em faturas sem invoice associada (esperado em dados de teste). Typecheck verde.

#### 2.2 Configuração de pagamentos sem feedback de teste `P2` `[XS]`
- **Onde:** `inertia/pages/escola/financeiro/configuracao-pagamentos.tsx`
- **Problema:** Após configurar Asaas, não tem como testar se a integração funciona sem criar uma cobrança real.
- **Fix:** Botão "Testar conexão" que faz ping na API do gateway e retorna status.

#### 2.3 ~~Tela de inadimplência sem filtro por faixa de atraso~~ `P2` `[XS]` FEITO (testado)
- [x] **Onde:** `app/validators/student_payment.ts`, `app/controllers/student_payments/list_student_payments_controller.ts`, `inertia/containers/student-payments-container.tsx`
- **Problema:** Coordenadora via todos os inadimplentes juntos sem poder filtrar por urgência.
- **Fix:** Filtro **server-side**: validator aceita `overdueMin`/`overdueMax`. Controller converte em range de `dueDate` (now - max ≤ dueDate ≤ now - min). Select "Faixa de atraso" com 5 faixas (1-15d, 16-30d, 31-60d, 61-90d, >90d) visível quando `status === 'OVERDUE'`. `SelectValue` controlado pra mostrar label correto ("Todas faixas") em vez do value raw — pattern do Base UI Select.
- **Validado 2026-05-28:** Chrome MCP impersonando Testerson (escola teste completo 3). Select abre com 6 opções, ao selecionar "1–15 dias" tabela filtra de 20 pra 7 registros (todos com 13 dias de atraso, sem os de 18 dias). Paginação reseta pra página 1. Typecheck verde.

#### Bônus — contratos com filtros em inglês `[XS]` FEITO (testado)
- [x] **Onde:** `inertia/containers/contracts-list-container.tsx`
- **Problema:** Filtros da página de contratos exibiam "All periods", "All courses", "All classes", "Active only" em inglês.
- **Fix:** Traduzidos para "Todos os períodos", "Todos os cursos", "Todas as turmas", "Apenas ativos/inativos/Todos". `SelectValue` controlado nos 4 selects pra renderizar label corretamente.
- **Validado 2026-05-28:** Chrome MCP — filtros aparecem em PT-BR ao carregar a página de contratos.

### Evolução

#### 2.4 Régua de cobrança automatizada `P1` `[M]`
- **Onde:** Não existe. Hoje a escola cobra manualmente.
- **Problema:** Cobrança de inadimplência é manual: coordenadora liga, manda WhatsApp avulso. Sem sequência automatizada.
- **Fix:** Régua configurável pela escola: D-3 (lembrete), D+0 (vencimento), D+7 (aviso amigável), D+15 (aviso formal), D+30 (proposta de acordo automática). Multi-canal: email + WhatsApp + push + in-app. A proposta de acordo (já implementada) entra como último passo da régua.
- **Quem tem:** Agenda Edu ("régua de cobrança" com 85% de redução de inadimplência), Isaac, Sponte, ClassApp, Proesc.

#### 2.5 Cálculo automático de juros e multa `P1` `[S]`
- **Onde:** Models `ContractInterestConfig` existem mas não há job de aplicação.
- **Problema:** Escola configura juros/multa no contrato mas o sistema não aplica automaticamente no valor da fatura.
- **Fix:** Job diário que recalcula valor de faturas OVERDUE com juros pro-rata e multa fixa conforme config do contrato.

#### 2.6 Comprovante de pagamento PDF `P2` `[S]`
- **Onde:** `inertia/containers/responsavel/student-payments-container.tsx`
- **Problema:** Responsável paga e não tem comprovante formal. Precisa pra declaração de IR ou pra empresa que reembolsa.
- **Fix:** Botão "Baixar comprovante" em faturas PAID. PDF com dados da escola, aluno, valor, data, método, hash de verificação.

#### 2.7 Conciliação bancária `P2` `[L]`
- **Onde:** Não existe.
- **Problema:** Coordenadora financeira confere pagamentos um a um contra extrato. Erros e retrabalho.
- **Fix:** Upload de extrato OFX/CSV → matching automático com faturas por valor+data → lista de divergências pra revisão manual.

#### 2.8 Emissão automática de NFS-e `P2` `[L]`
- **Onde:** Config de NFSe existe (`nfseEnabled`, `nfseMunicipalServiceCode`) mas sem lógica de geração/transmissão.
- **Problema:** Escola emite nota manualmente no site da prefeitura. Retrabalho.
- **Fix:** Integração com APIs de prefeitura (ou intermediário como eNotas/Focus NFe) pra emissão automática após confirmação de pagamento.
- **Quem tem:** Sponte (NF-e, NFS-e, NFC-e), Lyceum (RPS automático + NFSe).

#### 2.9 Pagamento parcial e parcelamento de fatura individual `P2` `[M]`
- **Onde:** Não existe. Fatura é paga inteira ou não.
- **Problema:** Responsável quer pagar metade agora e metade no mês que vem. Escola não consegue registrar isso.
- **Fix:** Opção de "Registrar pagamento parcial" que cria fatura remanescente. Opção de "Parcelar fatura" que divide em N.

### Competitivo

#### 2.10 Antecipação de recebíveis `P1` `[XL]`
- **Problema:** Escola precisa de caixa mas mensalidades vencem ao longo do mês. Sem opção de antecipar.
- **Fix:** Integração com gateway (Asaas já oferece antecipação) ou fintech parceira. Dashboard mostrando valor disponível pra antecipação, taxa, e botão de solicitar.
- **Quem tem:** Isaac ("Receita Garantida" — transfere valor mensal garantido independente de pagamento), Proesc (parceria Kedu).
- **Impacto:** Diferencial comercial enorme. Isaac usa isso como principal argumento de venda.

#### 2.11 Score de risco por família `P2` `[L]`
- **Problema:** Escola não sabe quais famílias têm maior probabilidade de inadimplência.
- **Fix:** Score baseado em histórico de pagamento, atrasos, acordos anteriores. Classificar em faixas (A/B/C/D). Alertar a coordenadora quando família C/D matricula.
- **Quem tem:** Isaac ("Isaac Score").

#### 2.12 Dashboard financeiro com benchmarks do setor `P2` `[L]`
- **Problema:** Escola sabe seu índice de inadimplência mas não sabe se tá melhor ou pior que a média do setor.
- **Fix:** Agregar dados anonimizados das escolas Anuá e mostrar benchmarks: "Sua inadimplência (12%) está acima da média do segmento Fundamental (8%)".
- **Quem tem:** Isaac (comparação de mercado), Sponte Analytics BI.

#### 2.13 Produto de crédito / capital de giro pra escola `P3` `[XL]`
- **Problema:** Escola precisa de capital pra reforma, equipamento, ou cobrir mês ruim.
- **Fix:** Parceria com fintech. Oferecer empréstimo baseado no histórico de receita da escola na plataforma.
- **Quem tem:** Isaac ("Isaac Crédito" — empréstimo de capital de giro).

#### 2.14 Seguro educacional `P3` `[XL]`
- **Problema:** Família perde emprego e tira o filho da escola. Churn.
- **Fix:** Parceria com seguradora. Oferecer seguro que cobre mensalidades por N meses em caso de desemprego/acidente.
- **Quem tem:** Isaac ("Isaac Seguros" — parceria Porto Seguro), Sycamore ("Tuition Refund Protection").

#### 2.15 Gestão de Prouni / FIES / bolsas governamentais `P3` `[L]`
- **Problema:** Escolas técnicas e faculdades precisam gerenciar alunos bolsistas do governo. Sem suporte.
- **Fix:** Módulo de bolsas governamentais com regras de elegibilidade, renovação, relatórios pro MEC.
- **Quem tem:** Lyceum (Prouni/FIES completo).

---

## 3. Pedagógico

### Polish

#### 3.1 ~~Notas sem indicador visual de desempenho (semáforo)~~ `P3` `[XS]` FEITO (testado)
- [x] **Onde:** `inertia/containers/responsavel/student-grades-container.tsx`
- **Problema:** Helper `getGradeColor` já existia mas aplicava só cor de texto. Pouco contraste, baixa visibilidade.
- **Fix:** Adicionado helper `getGradePill` que retorna classes de pílula completa (`bg-{cor}/10 ring-1 ring-{cor}/20 text-{cor}-700`). Aplicado em 4 pontos: média geral do resumo, média ponderada por disciplina, nota final por sub-período, nota da disciplina sem sub-período. Faixa: verde >= 7, amarelo 5-6.9, vermelho < 5.
- **Validado 2026-05-28:** Chrome MCP impersonando Cleiton Pai (responsável escola teste completo 3). Pílula vermelha "0.0" da média geral visível com background tinted + ring vermelho. Suporte light+dark mode.

#### 3.2 ~~Página de matérias é shell mínimo~~ `P3` `[S]` FALSO POSITIVO
- [~] **Onde:** `inertia/pages/escola/administrativo/materias.tsx`
- **Problema reportado:** Página com 1.8KB — interpretado como "shell vazio".
- **Verificado 2026-05-28:** Page é shell fino por design (pattern do codebase). Delega pra `SubjectsTableContainer` (5KB, 168 linhas) que faz CRUD completo, com `NewSubjectModal` e `EditSubjectModal`. Listagem, criação e edição funcionais.
- **Conclusão:** Item descartado. Se houver melhoria real (busca, edição inline, associação com professores), criar item específico após auditoria do container.

#### 3.3 ~~Frequência sem destaque visual pra padrões (faltas consecutivas)~~ `P2` `[XS]` FEITO (testado)
- [x] **Onde:** `inertia/containers/responsavel/student-attendance-container.tsx`
- **Problema:** Lista de presenças/faltas sem destacar padrões. Responsável não percebia 3+ faltas consecutivas.
- **Fix:** Função `findConsecutiveAbsenceIds` ordena registros por data e detecta runs de 3+ status `ABSENT` consecutivos. Banner de alerta vermelho no topo com `role="alert"` quando há padrão detectado. Rows da tabela com `bg-red-500/5` quando fazem parte do run. Tipagem correta via `Route.Response` do Tuyau (removido `any`).
- **Validado 2026-05-28:** Chrome MCP impersonando Cleiton Pai. Banner "Atenção: padrão de faltas detectado — Cleiton filho teve 3 ou mais faltas consecutivas" visível no topo. 4 rows de "09 de março, 2026" com status "Ausente" destacadas em vermelho claro.

### Evolução

#### 3.4 Boletim/relatório escolar em PDF `P1` `[M]`
- **Onde:** Dados existem (notas, frequência, médias) mas sem geração de PDF.
- **Problema:** Escola precisa entregar boletim impresso ou PDF pro responsável. Hoje faz manual no Word.
- **Fix:** Template de boletim configurável (logo da escola, layout por sub-período) com geração PDF. Botão "Baixar boletim" no portal do responsável e na tela da escola.
- **Quem tem:** Todos os concorrentes (Sponte, iScholar, Lyceum, SophiA, PowerSchool, Alma).

#### 3.5 Plano de aula / planejamento pedagógico `P2` `[L]`
- **Onde:** Não existe como feature dedicada.
- **Problema:** Professor planeja aulas em planilha/caderno. Sem registro no sistema, sem visibilidade pra coordenação.
- **Fix:** Tela de planejamento semanal por disciplina/turma. Professor registra objetivo, conteúdo, metodologia, recursos. Coordenador visualiza e comenta.
- **Quem tem:** Eduqo, ManageBac, SophiA, Lyceum, Transparent Classroom.

#### 3.6 Alerta automático de aluno em risco `P1` `[M]`
- **Onde:** `inertia/pages/escola/desempenho.tsx` tem tabela de "alunos em risco" mas é estática.
- **Problema:** Sistema mostra quem está em risco mas não notifica proativamente. Coordenadora precisa abrir a tela pra ver.
- **Fix:** Job semanal que detecta: média < 5, frequência < 75%, queda > 2 pontos entre sub-períodos. Notifica coordenador + professor + responsável (configurável).
- **Quem tem:** Alma (Beacon AI — D/F trends, achievement gaps), PowerSchool (automated attendance outreach), Lyceum (indicadores de evasão).

#### 3.7 Dashboard do professor `P2` `[L]`
- **Onde:** Não existe. Professor usa o portal da escola sem visão específica.
- **Problema:** Professor quer ver suas turmas, próximas aulas, atividades pendentes de correção, frequência resumida. Hoje navega pelo menu geral.
- **Fix:** Dashboard personalizado do professor com: turmas do dia, atividades pra corrigir, alunos em risco nas suas disciplinas, agenda da semana.
- **Quem tem:** Sponte (Portal do Professor PWA), Alma, ManageBac, PowerSchool.

#### 3.8 Diário de classe digital `P2` `[M]`
- **Onde:** Frequência e notas existem separados. Não existe "diário de classe" unificado.
- **Problema:** Professor quer abrir a turma do dia e ver: chamada + conteúdo dado + observações, tudo junto.
- **Fix:** Tela de "Diário de Classe" por turma/data com: chamada (já existe), campo de conteúdo ministrado, observações. Histórico navegável por data.
- **Quem tem:** Sponte, iScholar, Proesc, SophiA.

#### 3.9 Escala de avaliação configurável `P2` `[S]`
- **Onde:** Models referenciam `gradeScale` mas sem UI de configuração.
- **Problema:** Escola que usa conceitos (A/B/C/D) ou escala 0-100 não consegue configurar. Hardcoded pra 0-10.
- **Fix:** Tela de configuração de escala de avaliação por período/curso. Suportar numérica, conceitual, mista.
- **Quem tem:** Alma (custom rubrics), ManageBac (multi-curricula), Gradelink.

#### 3.10 Aulas extras sem UI `P3` `[S]`
- **Onde:** Models `ExtraClass` e `ExtraClassAttendance` existem com CRUD completo no backend. Sem página no frontend.
- **Problema:** Feature existe no backend mas professor não consegue usar.
- **Fix:** Página `/escola/pedagogico/aulas-extras` com listagem, criação, e marcação de presença.

### Competitivo

#### 3.11 Banco de questões com auto-correção `P2` `[XL]`
- **Problema:** Professor cria provas do zero toda vez. Sem reuso, sem correção automática.
- **Fix:** Banco de questões por disciplina/série com tipos (múltipla escolha, V/F, dissertativa com rubrica). Auto-correção de objetivas. Importação de .docx.
- **Quem tem:** Eduqo (130K+ questões, auto-correção, alinhamento BNCC/ENEM), PowerSchool.

#### 3.12 Alinhamento curricular BNCC `P2` `[L]`
- **Problema:** Escola precisa mapear currículo pra BNCC mas faz em planilha. Sem visibilidade de cobertura.
- **Fix:** Cadastro de habilidades BNCC por disciplina/ano. Vincular atividades/provas a habilidades. Dashboard de cobertura curricular.
- **Quem tem:** Eduqo (matrizes BNCC/ENEM/Prova Brasil), ManageBac (600+ standards), Alma.

#### 3.13 Gestão de biblioteca `P3` `[L]`
- **Problema:** Escola com biblioteca não tem controle de empréstimos no sistema.
- **Fix:** Módulo de biblioteca: cadastro de acervo, empréstimo/devolução por aluno, alertas de atraso, relatórios de uso.
- **Quem tem:** iScholar, SophiA (módulo Philos).

#### 3.14 Conteúdo digital / LMS leve `P3` `[XL]`
- **Problema:** Professor quer compartilhar material (PDF, vídeo, link) com a turma. Hoje usa Google Classroom em paralelo.
- **Fix:** Repositório de materiais por turma/disciplina. Upload de arquivos, links, vídeos. Aluno acessa pelo portal.
- **Quem tem:** Eduqo (Cadernos Digitais), SophiA (Odilo — Netflix de conteúdo), ManageBac, PowerSchool/Schoology.

#### 3.15 Avaliação de fluência leitora `P3` `[L]`
- **Problema:** Escolas de educação infantil/fundamental precisam avaliar fluência e não têm ferramenta.
- **Fix:** Módulo de avaliação individual: professor grava leitura do aluno, sistema mede palavras/minuto, registra evolução.
- **Quem tem:** Eduqo (fluência leitora — único no BR).

---

## 4. Comunicação

### Polish

#### 4.1 Comunicados sem rich text editor `P2` `[S]`
- **Onde:** `inertia/pages/escola/comunicados/novo.tsx`
- **Problema:** Editor de comunicado é textarea simples. Sem negrito, itálico, lista, link.
- **Fix:** Substituir por Tiptap (já usado no chat de IA) com toolbar mínima: bold, italic, lista, link.

#### 4.2 Comunicados sem anexos `P2` `[S]`
- **Onde:** `inertia/pages/escola/comunicados/novo.tsx`
- **Problema:** Coordenadora quer enviar circular com PDF anexo. Não consegue.
- **Fix:** Campo de upload de arquivos (PDF, imagem) no form de comunicado. Exibir no portal do responsável com botão de download.

#### 4.3 ~~Feed/mural com implementação mínima~~ `P3` `[S]` FALSO POSITIVO
- [~] **Onde:** `inertia/pages/escola/mural.tsx`
- **Problema reportado:** Página com 1.6KB — interpretado como "shell vazio".
- **Verificado 2026-05-28:** Mural tem H1, descrição, botão "Nova publicação", `PostsFeed` com Suspense fallback, `NewPostModal`. Feed cronológico funcional. Auditar containers (`posts-feed`, `post-card`) pra ver se faltam features (fotos múltiplas, reações além de like).
- **Conclusão:** Item descartado. Melhorias específicas (Stories estilo ClassDojo, vídeos, reações) ficam como features novas no módulo Comunicação.

### Evolução

#### 4.4 Agendamento de publicação `P1` `[S]`
- **Onde:** `inertia/pages/escola/comunicados/novo.tsx`
- **Problema:** Comunicado é publicado na hora. Sem agendar pra segunda-feira 7h.
- **Fix:** Campo "Publicar em" com date/time picker. Job que publica no horário agendado.
- **Quem tem:** Agenda Edu, ClassApp.
- **Ref:** AUDITORIA-2026-05 #11 (parcial).

#### 4.5 Confirmação de leitura `P2` `[S]`
- **Onde:** `inertia/pages/responsavel/comunicados.tsx`
- **Problema:** Escola não sabe quem leu o comunicado. Zero tracking.
- **Fix:** Marcar como "lido" quando responsável abre. Dashboard pra escola: "80% leram, 20% pendentes". Opção de reenviar pra quem não leu.
- **Quem tem:** ClassApp (engagement analytics), Agenda Edu, Bloomz, SophiA.

#### 4.6 Variáveis em templates de comunicado `P2` `[XS]`
- **Onde:** `AnnouncementTemplate` model existe mas sem suporte a variáveis.
- **Problema:** Template "Reunião de pais da {{turma}}" requer edição manual toda vez.
- **Fix:** Parser simples de `{{nomeAluno}}`, `{{turma}}`, `{{serie}}`. Substituir no momento da publicação por audiência.

#### 4.7 Respostas e conversas em comunicados `P2` `[M]`
- **Onde:** Model `Comment` existe com likes mas sem thread.
- **Problema:** Responsável quer responder o comunicado com dúvida. Hoje é uma lista flat de comentários.
- **Fix:** Respostas aninhadas (1 nível). Notificar autor quando há resposta. Opção da escola de desabilitar comentários por comunicado.

### Competitivo

#### 4.8 Integração WhatsApp Business API `P1` `[L]`
- **Problema:** Coordenadora manda comunicado no Anuá e depois reescreve no WhatsApp. Duplicação de esforço.
- **Fix:** Integração com WhatsApp Business API. Ao publicar comunicado, dispara automaticamente via WhatsApp pra responsáveis que optaram. Templates pre-aprovados pelo Meta.
- **Quem tem:** Agenda Edu (integração completa), Lyceum (chatbot WhatsApp), Proesc, SophiA.
- **Ref:** AUDITORIA-2026-05 #11.

#### 4.9 Disparos por SMS `P2` `[M]`
- **Problema:** Responsáveis sem smartphone (zona rural, avós) não recebem comunicados digitais.
- **Fix:** Integração com gateway SMS (Twilio, Zenvia). Opt-in por responsável. Texto truncado com link pro portal.
- **Quem tem:** Sponte, iScholar, Sycamore (Twilio).

#### 4.10 Tradução automática de comunicados `P3` `[M]`
- **Problema:** Escolas internacionais ou com famílias estrangeiras precisam traduzir manualmente.
- **Fix:** Botão "Traduzir" que usa IA (Claude) pra gerar versão em inglês/espanhol. Publicar bilíngue.
- **Quem tem:** Bloomz (250 idiomas), ClassDojo (190 idiomas), Edlio (auto-tradução).

#### 4.11 Workflow de aprovação de comunicado `P3` `[S]`
- **Problema:** Professor publica comunicado sem revisão da coordenação. Risco de informação incorreta.
- **Fix:** Permissão "requer aprovação" por role. Professor cria draft → coordenador aprova → publica.
- **Quem tem:** ClassApp (review + approve antes de enviar — diferencial deles).

#### 4.12 Newsletter builder com drag-and-drop `P3` `[L]`
- **Problema:** Escola quer mandar newsletter mensal bonita. Hoje é texto puro.
- **Fix:** Builder visual de newsletter com blocos (texto, imagem, destaque, calendário). Exporta como email HTML.
- **Quem tem:** Bloomz (drag-and-drop templates).

#### 4.13 Chatbot de atendimento ao responsável `P2` `[L]`
- **Problema:** Responsável liga na escola pra perguntar "quando é a reunião?" ou "quanto devo?". Sobrecarrega secretaria.
- **Fix:** Chatbot no portal do responsável (ou WhatsApp) que responde perguntas frequentes consultando dados do sistema: próximos eventos, faturas pendentes, notas do filho, horário de aulas.
- **Quem tem:** Lyceum (IBM Watson — 48K leads, responde sobre notas/documentos/pagamentos), Finalsite (ASK AI — 24/7 em múltiplos idiomas).

---

## 5. Cantina & Loja

### Polish

#### 5.1 PDV sem scan de código de barras `P2` `[S]`
- **Onde:** `inertia/pages/escola/cantina/pdv.tsx`
- **Problema:** Operador digita nome do item manualmente. Com 50 itens no cardápio, é lento.
- **Fix:** Campo de scan via câmera (ou leitor USB) que busca item por código.

#### 5.2 Vendas sem filtro por período e totalização `P3` `[XS]`
- **Onde:** `inertia/pages/escola/cantina/vendas.tsx` (2.8KB — mínimo)
- **Problema:** Relatório de vendas é básico. Sem filtro por semana/mês, sem total por item, sem gráfico de tendência.
- **Fix:** Filtro por range de data, totalização por item/categoria, gráfico de vendas diárias.

#### 5.3 Cardápio sem foto dos itens `P3` `[XS]`
- **Onde:** `inertia/pages/escola/cantina/cardapio.tsx`
- **Problema:** Cardápio é texto. Sem apelo visual, especialmente pra crianças.
- **Fix:** Campo de foto opcional por item/refeição. Exibir no cardápio e na loja do aluno.

### Evolução

#### 5.4 Gestão de estoque com alerta de mínimo `P2` `[M]`
- **Onde:** Models de `CanteenItem` existem mas sem campo de estoque/mínimo.
- **Problema:** Cantineira descobre que acabou o suco na hora do rush. Sem controle de estoque.
- **Fix:** Campo `currentStock` e `minimumStock` por item. Deduzir automaticamente na venda. Notificação quando atingir mínimo.

#### 5.5 Pré-encomenda de refeições `P2` `[M]`
- **Onde:** `CanteenMealReservation` existe mas UI é mínima (2KB).
- **Problema:** Pais poderiam encomendar almoço do dia anterior. Reduz desperdício e fila.
- **Fix:** Tela no portal do responsável: ver cardápio do dia seguinte → reservar itens → pagar antecipado via saldo. Cantina recebe lista de encomendas.
- **Quem tem:** SchoolsBuddy (booking system).

#### 5.6 Dashboard consolidado de marketplace `P2` `[L]`
- **Onde:** Cada loja tem financeiro separado. Sem visão consolidada.
- **Problema:** Admin da escola não vê GMV total, comissão, top produtos, sem visão geral.
- **Fix:** Dashboard agregado: GMV total, GMV por loja, comissão Anuá, top 10 produtos, tendência mensal.
- **Ref:** AUDITORIA-2026-05 #40.

### Competitivo

#### 5.7 Carteira digital unificada (parent wallet) `P1` `[L]`
- **Problema:** Responsável tem saldos separados: cantina, loja, crédito. Sem unificação.
- **Fix:** Carteira única do responsável. Recarrega uma vez, gasta em cantina, loja, eventos, atividades extracurriculares. Extrato unificado.
- **Quem tem:** FACTS (prepay accounts), Diário Escola (Cantina Escola — carteira digital).
- **Diferencial:** Nenhum concorrente BR (exceto Diário Escola) tem carteira digital integrada com cantina + loja. Oportunidade enorme.

#### 5.8 Restrições alimentares e alertas de alérgenos `P2` `[S]`
- **Problema:** Aluno com alergia a amendoim compra item com amendoim. Risco de saúde.
- **Fix:** Campo de restrições alimentares no cadastro do aluno. Alerta no PDV quando item contém alérgeno do aluno. Bloquear venda opcionalmente.
- **Quem tem:** Skyward (allergen tracking), Gradelink (via medical records).

#### 5.9 Informação nutricional no cardápio `P3` `[M]`
- **Problema:** Pais querem saber calorias/macro do almoço escolar. Obrigatório em alguns estados.
- **Fix:** Campos opcionais de informação nutricional por item. Exibir no cardápio público.

#### 5.10 QR code por aluno pra compra rápida `P2` `[S]`
- **Problema:** Identificar aluno no PDV é lento (digitar nome). Na fila da cantina, cada segundo importa.
- **Fix:** Gerar QR code único por aluno (na carteirinha digital ou app). Scan no PDV identifica e carrega saldo instantaneamente.
- **Quem tem:** Diário Escola (reconhecimento facial), Vlupt (facial recognition).

---

## 6. Gamificação

### Polish

#### 6.1 Leaderboard com filtro por turma `P2` `[XS]`
- **Onde:** `inertia/pages/escola/gamificacao/rankings.tsx` (595 bytes — mínimo)
- **Problema:** Ranking mostra todos os alunos juntos. Aluno de 7 anos compete com aluno de 14.
- **Fix:** Filtro por turma/série. Ranking "Minha turma" como default.

#### 6.2 ~~Conquistas sem notificação multi-canal~~ `P3` `[XS]` FEITO
- [x] **Onde:** `app/jobs/gamification/process_gamification_event_job.ts`
- **Problema:** Aluno desbloqueia conquista e não sabe até abrir o app. Push + email + WhatsApp + in-app não eram disparados.
- **Fix:** Job agora coleta achievements desbloqueados durante a transação (com nome/descrição/pontos) e detecta level up. Pós-commit, dispara `notificationService.send()` que cuida dos 4 canais (in-app, email, WhatsApp, push) respeitando `NotificationPreference` do usuário. Tipos `ACHIEVEMENT_UNLOCKED` e `LEVEL_UP` já existiam no enum + UI de preferências. Try/catch envolvendo cada dispatch — falha num canal não impede os outros.
- **Validado 2026-05-28:** Typecheck verde.

#### 6.3 Desafios sem progresso visual `P2` `[XS]`
- **Onde:** `inertia/pages/escola/gamificacao/desafios.tsx`
- **Problema:** Desafio existe mas aluno não vê barra de progresso ("3/5 tarefas completas").
- **Fix:** Progress bar no card do desafio com contagem de critérios cumpridos.

### Evolução

#### 6.4 Gamificação conectada a eventos acadêmicos `P1` `[L]`
- **Onde:** Fazendinha é minigame isolado. Sem hooks nos eventos do domínio.
- **Problema:** Aluno ganha pontos só na fazendinha. Nota >= 8, frequência 100%, tarefa entregue não rendem nada.
- **Fix:** Event hooks: `GradeCreated(>= 8)` → sementes bônus + push. `AttendanceMonth(100%)` → colheita extra. `AssignmentSubmitted(on time)` → pontos. Configurável por escola.
- **Ref:** AUDITORIA-2026-05 #14.

#### 6.5 Recompensas resgatáveis na cantina/loja `P1` `[M]`
- **Onde:** Rewards existem mas são virtuais. Sem integração com cantina.
- **Problema:** Pontos não valem nada tangível. Engajamento cai após 2 semanas.
- **Fix:** Escola configura recompensas reais: vale-cantina (ex: 100 pontos = 1 lanche), desconto na loja, brinde físico. Resgate debita pontos e credita saldo na cantina ou gera cupom.
- **Diferencial:** Nenhum concorrente faz isso. É a "unified student economy" — pontos acadêmicos → valor real.

#### 6.6 Streak com freeze e recovery `P2` `[S]`
- **Onde:** Model `StudentGamification.streak` existe mas sem manutenção.
- **Problema:** Streak quebra no fim de semana ou feriado. Desmotiva.
- **Fix:** Job diário que incrementa/reseta streak. Freeze automático em feriados/fins de semana. Opção de "streak freeze" comprável com pontos (1/mês).

#### 6.7 Eventos sazonais e quests diárias `P2` `[M]`
- **Onde:** Não existe.
- **Problema:** Gamificação é estática. Sem novidade, sem urgência.
- **Fix:** Sistema de quests diárias ("Responda 1 atividade hoje → 10 pontos"). Eventos sazonais temáticos (Festa Junina, Semana da Ciência) com recompensas exclusivas e leaderboard temporário.

### Competitivo

#### 6.8 Avatares customizáveis e economia virtual `P2` `[L]`
- **Onde:** `create-character.tsx` existe mas é básico.
- **Problema:** Avatar é escolhido uma vez. Sem acessórios, sem personalização progressiva.
- **Fix:** Sistema de acessórios (roupas, pets, itens de decoração da fazenda) compráveis com pontos. Cada conquista desbloqueia item exclusivo.
- **Quem tem:** ClassDojo (125+ acessórios de monstro — principal driver de engajamento deles).

#### 6.9 Espaço social entre alunos (por turma) `P3` `[L]`
- **Onde:** Não existe. Portal do aluno é individual.
- **Problema:** Sem interação entre colegas no app. Engajamento é solitário.
- **Fix:** Mural por turma onde alunos podem postar conquistas, comentar. Moderação automática + aprovação do professor. Visitação de fazendas de colegas.
- **Quem tem:** ClassDojo (Dojo Islands — mundo social gamificado).

#### 6.10 House points / pontuação por equipe `P3` `[M]`
- **Problema:** Leaderboard é individual. Sem competição coletiva que incentive colaboração.
- **Fix:** Sistema de "casas" (times dentro da turma). Pontos individuais somam pra casa. Ranking coletivo. Prêmio mensal pra casa vencedora.
- **Quem tem:** SchoolMint Hero (house points), iSAMS (rewards tracking).

#### 6.11 Gamificação = diferencial competitivo absoluto `[INFO]`
- Nenhum concorrente brasileiro (Sponte, Isaac, iScholar, Proesc, SophiA, ClassApp, Agenda Edu, Eduqo) tem módulo de gamificação nativo. Zero.
- Internacionalmente, só ClassDojo e SchoolMint Hero têm algo comparável, e nenhum integra com cantina/loja/financeiro.
- A "student economy" unificada (pontos acadêmicos → resgate na cantina/loja) é whitespace completo. Ninguém no mundo faz isso de forma integrada.

---

## 7. Administrativo

### Polish

#### 7.1 ~~Páginas de funcionários e professores são shells mínimos~~ `P3` `[S]` FALSO POSITIVO
- [~] **Onde:** `funcionarios.tsx`, `professores.tsx`
- **Problema reportado:** Páginas pequenas (603 bytes e 1.6KB) — interpretado como "shells sem conteúdo".
- **Verificado 2026-05-28:** Funcionarios tem H1, descrição e `EmployeesListContainer`. Professores tem **tabs** (Lista + Ausências) com `TeachersListContainer` e `TeacherAbsencesTable`. Pattern do codebase: page fina → container faz o trabalho.
- **Conclusão:** Item descartado. Se faltam filtros/empty states, auditar containers individualmente.

#### 7.2 Parceiros/fornecedores sem informação útil `P3` `[XS]`
- **Onde:** `inertia/pages/escola/administrativo/parceiros.tsx` (1.5KB)
- **Problema:** Lista de parceiros é básica. Sem categorização, sem histórico de compras.
- **Fix:** Adicionar categoria (alimentação, material, serviços), telefone/email inline, link pra histórico de solicitações de compra.

### Evolução

#### 7.3 Importação bulk de alunos (CSV/Excel) `P1` `[M]`
- **Onde:** Não existe. Cadastro é individual.
- **Problema:** Escola migra de outro sistema e precisa cadastrar 500 alunos. Um por um.
- **Fix:** Upload de CSV/Excel com colunas mapeáveis → validação → preview de erros → importação em batch. Mesmo pattern do export já feito.
- **Quem tem:** Todos os concorrentes maduros. É table stakes.

#### 7.4 Importação bulk de professores e funcionários `P2` `[M]`
- **Onde:** Não existe.
- **Problema:** Mesmo problema da importação de alunos, pra staff.
- **Fix:** Mesmo componente de importação, adaptado pra modelo de Employee/Teacher.

#### 7.5 Solicitações de compra com workflow de multi-aprovação `P2` `[S]`
- **Onde:** `inertia/pages/escola/administrativo/solicitacoes-de-compra.tsx`
- **Problema:** Workflow é linear (pedir → aprovar → comprar → receber). Sem multi-aprovação (ex: diretor + financeiro precisam aprovar acima de R$500).
- **Fix:** Config de threshold por escola. Acima do threshold, requer segunda aprovação. Notificação pra cada aprovador.
- **Quem tem:** Synergetic (purchase orders with approval workflows).

#### 7.6 Folha de ponto com relatório mensal `P2` `[S]`
- **Onde:** `inertia/pages/escola/administrativo/folha-de-ponto.tsx` (1.4KB)
- **Problema:** Registro de ponto existe mas sem consolidação mensal, sem cálculo de horas extras, sem export.
- **Fix:** View mensal consolidada por funcionário. Total de horas, extras, faltas. Export PDF/CSV.

#### 7.7 Trilha de auditoria de impersonation visível `P1` `[M]`
- **Onde:** `get_impersonation_status_controller.ts` existe mas sem log estruturado.
- **Problema:** Admin Anuá impersona escola e faz ações sem registro. Risco multi-tenant.
- **Fix:** Audit log `{user_id, impersonated_school_id, action, before, after, at}`. Tela em `/admin/audit` com timeline filtrável.
- **Ref:** AUDITORIA-2026-05 #5.

### Competitivo

#### 7.8 Gestão de transporte escolar `P3` `[L]`
- **Problema:** Escola oferece transporte mas gerencia rotas, motoristas e alunos em planilha.
- **Fix:** Módulo de transporte: rotas, pontos de parada, alunos por rota, motorista responsável, horários. Notificação pro responsável quando ônibus sai/chega.
- **Quem tem:** iScholar (transporte escolar), Classter (transportation management), SchoolsBuddy (route organization).

#### 7.9 Controle de acesso / catraca `P3` `[L]`
- **Problema:** Escola com catraca/portão eletrônico não integra com o sistema. Presença é manual.
- **Fix:** API de integração com catracas (QR code ou cartão). Registro de entrada/saída do aluno. Notificação pro responsável ("João chegou à escola às 7:15").
- **Quem tem:** Sponte (integração catraca), iScholar, Diário Escola (reconhecimento facial).

#### 7.10 Gestão de espaços e salas `P3` `[M]`
- **Problema:** Escola quer reservar laboratório, quadra, auditório. Gerencia em quadro branco.
- **Fix:** Calendário de espaços com reserva por professor/coordenador. Conflito visual. Aprovação opcional.
- **Quem tem:** Lyceum (physical space + virtual agenda).

#### 7.11 Enfermaria / posto médico `P3` `[M]`
- **Problema:** Aluno vai ao posto médico e a escola registra em caderno. Responsável não é notificado.
- **Fix:** Registro de visita médica por aluno (queixa, ação tomada, medicação administrada). Notificação automática pro responsável. Histórico de saúde por aluno.
- **Quem tem:** iSAMS (Medical Centre com notificação aos pais).

---

## 8. Calendário & Eventos

### Polish

#### 8.1 ~~Eventos com lembrete D-3, D-0 + push imediato em cancel/reschedule~~ `P2` `[S]` FEITO
- [x] **Onde:** `start/jobs/send_academic_digest.ts`, `start/jobs/send_event_day_reminders.ts`, `start/jobs/send_parental_consent_reminders.ts`, `app/services/event_notification_service.ts`.
- **Problema:** Daily digest cobria D-1 mas faltava (a) D-3 pra organizar com antecedência, (b) D-0 manhã com push, (c) push imediato em cancelamento/mudança/autorização pendente.
- **Fix em 3 partes:**
  - **Parte 1 — Daily digest com seção "Daqui a 3 dias":** Adicionado bucket `'tomorrow' | 'in-3-days'` ao `DigestItem`. Quando `kind='daily'`, segunda janela carrega só eventos importantes (`PARENTS_MEETING`, `FIELD_TRIP`, `SPORTS_EVENT`, `SCHOOL_PARTY`, `ARTS_SHOW`, `SCIENCE_FAIR`, eventos com `requiresParentalConsent=true`, ou priority `HIGH`/`URGENT`). Nova seção no email com pill violeta e copy "Eventos importantes que pedem preparo antecipado".
  - **Parte 2 — Job de push D-0 matinal (`SendEventDayRemindersJob` 7:30h):** Busca eventos importantes do dia, resolve audiências (SCHOOL/CLASS/LEVEL/ACADEMIC_PERIOD), agrupa por destinatário (1 push mesmo com 3 eventos), dispara via `notificationService.send()` (4 canais). Idempotente por `(userId, bucket-dia)`.
  - **Parte 3 — Push imediato em mudança de evento + lembrete autorização:**
    - `notifyEventCancelled()` plugado no `cancel_event_controller` — push pra todos os destinatários quando evento é cancelado.
    - `notifyEventRescheduled()` plugado no `update_event_controller` — detecta mudança de `startDate` ou `location` em evento `PUBLISHED` e notifica.
    - `SendParentalConsentRemindersJob` 10h diário — lembrete D-3 pra `EventParentalConsent` com `status='PENDING'`, throttle 24h via `reminderSentAt`.
- **Validado 2026-05-28:** Typecheck verde. Todos respeitam `NotificationPreference` (4 canais via `notificationService`).

#### 8.2 Calendário sem visualização de feriados `P3` `[XS]`
- **Onde:** `inertia/pages/responsavel/calendario.tsx`
- **Problema:** Feriados nacionais/estaduais/municipais não aparecem no calendário.
- **Fix:** Carregar feriados BR por estado/município e exibir como eventos recorrentes. API pública ou lista hardcoded atualizável.

### Evolução

#### 8.3 Detecção de conflito de horário `P2` `[S]`
- **Onde:** `inertia/pages/escola/pedagogico/horarios.tsx`
- **Problema:** Professor alocado em duas turmas no mesmo horário. Sistema não avisa.
- **Fix:** Validação no backend ao salvar horário. Warning visual no frontend se conflito detectado.

#### 8.4 Confirmação de presença em eventos (RSVP) `P2` `[S]`
- **Onde:** `EventParticipant` model existe com status mas sem UI de RSVP no portal do responsável.
- **Problema:** Escola cria evento "Reunião de pais" mas não sabe quantos virão.
- **Fix:** Card no portal do responsável: "Reunião de pais — Confirmar presença". Contador pra escola.
- **Quem tem:** ClassApp, Agenda Edu, SchoolsBuddy, Bloomz.

#### 8.5 Agendamento de reunião pais-professor `P2` `[M]`
- **Onde:** Não existe como feature dedicada.
- **Problema:** Responsável quer falar com professor. Liga na escola, secretária intermedia.
- **Fix:** Professor disponibiliza slots de horário. Responsável agenda pelo portal. Confirmação automática. Link de videoconferência opcional (Google Meet).
- **Quem tem:** Bloomz (conference scheduling), SchoolsBuddy (parent-teacher conferences com screen sharing).

### Competitivo

#### 8.6 Booking unificado (atividades extracurriculares, passeios, reuniões) `P2` `[L]`
- **Problema:** Cada tipo de evento tem fluxo diferente. Sem sistema unificado de inscrição + pagamento.
- **Fix:** Sistema de booking: escola cria atividade (aula de futebol, passeio, curso de robótica) → responsável inscreve o filho → paga pelo sistema. Vagas limitadas, fila de espera, cancelamento.
- **Quem tem:** SchoolsBuddy (atividades + trips + music lessons + wraparound care tudo no mesmo sistema com pagamento integrado).

#### 8.7 Gestão de voluntários `P3` `[M]`
- **Problema:** Escola quer pais voluntários pra feira de ciências. Gerencia por WhatsApp.
- **Fix:** Evento com opção "Precisamos de X voluntários". Responsável se inscreve. Escola vê lista e confirma.
- **Quem tem:** Bloomz (volunteer sign-ups), Sycamore (volunteer service hour tracking).

---

## 9. IA & Automação

### Polish

#### 9.1 IA sem sugestões contextuais no chat `P2` `[S]`
- **Onde:** `inertia/pages/escola/ia.tsx`
- **Problema:** Chat de IA abre vazio. Coordenadora não sabe o que perguntar.
- **Fix:** Sugestões dinâmicas baseadas no contexto: "Você tem 5 alunos com frequência < 75%", "3 famílias com pagamento > 30 dias de atraso". Chips clicáveis.

#### 9.2 Token usage sem alerta de limite `P3` `[XS]`
- **Onde:** `inertia/pages/admin/ai/tokens.tsx`
- **Problema:** Admin vê consumo mas sem alerta quando escola atinge 80% do limite do plano.
- **Fix:** Threshold configurável com notificação email/push pro admin.

### Evolução

#### 9.3 IA gerando rascunho de comunicado `P1` `[M]`
- **Onde:** Integrar IA com `inertia/pages/escola/comunicados/novo.tsx`
- **Problema:** Coordenadora abre o editor e escreve do zero. IA do sistema sabe tudo sobre a escola mas não ajuda a escrever.
- **Fix:** Botão "Gerar com IA" no editor de comunicado. Prompt: "Escreva um comunicado sobre [tema] para [audiência] no tom [formal/informal]". IA gera rascunho editável.
- **Quem tem:** Bloomz (AI assistant pra mensagens), Isaac/Meu Arco (AI-assisted messaging), Diário Escola (DEia — auto-personaliza mensagens).

#### 9.4 IA gerando comentários de boletim `P2` `[M]`
- **Onde:** Integrar com módulo pedagógico.
- **Problema:** Professor escreve comentário individual pra cada aluno no boletim. 30 alunos x 6 disciplinas.
- **Fix:** IA gera sugestão de comentário baseada em notas, frequência, participação. Professor edita e aprova.
- **Quem tem:** Classe365 ("smarter assessment feedback with AI").

#### 9.5 Automação de workflows configurável `P2` `[L]`
- **Onde:** Não existe. Automações são hardcoded em jobs.
- **Problema:** Escola quer "quando aluno faltar 3 dias, notificar coordenador". Precisa de dev.
- **Fix:** Engine de regras simples: trigger (evento) → condição → ação. Ex: "Falta registrada" → "3a falta no mês" → "Notificar coordenador + responsável". UI de configuração.
- **Quem tem:** PowerSchool (automated attendance outreach), Alma (Beacon AI alerts).

### Competitivo

#### 9.6 Early warning system com ML `P1` `[XL]`
- **Problema:** Aluno vai mal e ninguém percebe até reprovar. Aluno evade e escola perde receita.
- **Fix:** Modelo preditivo que cruza: queda de notas, aumento de faltas, redução de engajamento (gamificação), inadimplência financeira. Gera score de risco por aluno. Alerta coordenador quando score cruza threshold.
- **Quem tem:** Alma Beacon AI (D/F trends, absenteeism risk, achievement gaps), PowerSchool (Connected Intelligence), Lyceum (evasion/retention indicators), Illuminate (previsão em 6 data points).
- **Diferencial:** Anuá tem dados que nenhum concorrente tem juntos: acadêmico + financeiro + gamificação + cantina. O modelo pode ser mais preciso.

#### 9.7 IA como tutor do aluno `P3` `[XL]`
- **Problema:** Aluno tem dúvida em casa e não tem quem pergunte.
- **Fix:** Chat de IA no portal do aluno, contextualizado com as matérias/série do aluno. Responde dúvidas sobre conteúdo escolar. Limita escopo pra evitar uso recreativo.
- **Quem tem:** PowerSchool PowerBuddy (tutor AI adaptativo por série), ClassDojo Dojo Tutor.

#### 9.8 OCR de documentos com aprovação automática `P2` `[L]`
- **Problema:** Secretária revisa cada documento enviado manualmente. RG, comprovante de residência, certidão.
- **Fix:** Claude Vision analisa documento: legível? é o tipo correto? extrai dados (nome, endereço). Documentos OK passam direto. Duvidosos vão pra fila de revisão humana.
- **Quem tem:** Lyceum (OCR validation), Blackbaud (AI-driven document review pra financial aid).
- **Ref:** AUDITORIA-2026-05 #34.

#### 9.9 Analytics preditivo de receita `P2` `[L]`
- **Problema:** Escola não sabe quanto vai receber no mês que vem. Planejamento financeiro é no escuro.
- **Fix:** Projeção de receita baseada em: matrículas ativas × valor do contrato - inadimplência esperada (baseada em score). Cenários otimista/pessimista.
- **Quem tem:** Proesc LIA (financial forecasting), FACTS IQ.

---

## 10. Admin Anuá (Multi-rede & SaaS)

### Polish

#### 10.1 Onboarding de escola sem wizard guiado `P2` `[M]`
- **Onde:** `inertia/pages/admin/onboarding.tsx` (mínimo)
- **Problema:** Nova escola cai no sistema vazio. Sem orientação de "configure primeiro: período letivo → cursos → turmas → alunos".
- **Fix:** Wizard de 5 passos com checklist persistente. Marcar como concluído ao completar cada passo. Barra de progresso no dashboard da escola.
- **Quem tem:** FACTS (custom onboarding experience for new families — adaptável pra escolas).

#### 10.2 Impersonation sem indicador claro de qual escola `P2` `[XS]`
- **Onde:** `ImpersonationBanner` existe mas pode ser mais informativo.
- **Problema:** Admin impersonando pode esquecer qual escola está. Risco de editar dados errados.
- **Fix:** Banner com nome da escola em destaque, cor diferenciada, e botão "Voltar ao Admin" sempre visível.

### Evolução

#### 10.3 Multi-rede com dashboard consolidado `P1` `[XL]`
- **Onde:** `inertia/pages/admin/redes.tsx` (stub).
- **Problema:** Rede com 10 escolas precisa de 10 logins. Sem visão consolidada.
- **Fix:** Entidade "Rede" com escolas filhas. Dashboard agregado: matrículas/MRR/inadimplência por escola. Switcher de contexto (Rede → Escola). Replicar configurações entre escolas.
- **Quem tem:** Sponte (Franqueador — 40+ redes), Isaac (Painel de Gestão com benchmarks), Lyceum (multi-campus), Proesc (multi-CNPJ), iSAMS (Central Manage com multi-timezone).
- **Ref:** AUDITORIA-2026-05 #10.

#### 10.4 Feature toggles por escola `P2` `[M]`
- **Onde:** Não existe. Todas as escolas veem todas as features.
- **Problema:** Escola no plano Básico vê features do plano Premium mas não pode usar. Confuso.
- **Fix:** Feature flags por escola/plano. Admin controla quais módulos estão habilitados. UI esconde menus de features desabilitadas (com upsell opcional).

#### 10.5 Churn prediction por escola `P2` `[L]`
- **Onde:** `inertia/pages/admin/analytics/school-health.tsx` tem health status mas é reativo.
- **Problema:** Admin descobre que escola churnou quando ela cancela. Sem sinal antecipado.
- **Fix:** Score de churn baseado em: queda de logins, queda de matrículas, aumento de inadimplência, redução de features usadas. Alerta quando score cruza threshold. CTA: "Agendar call de retenção".

### Competitivo

#### 10.6 Benchmarks entre escolas da plataforma `P1` `[L]`
- **Problema:** Escola não sabe se seu índice de inadimplência, taxa de matrícula ou engajamento de responsáveis é normal.
- **Fix:** Agregar dados anonimizados de todas as escolas Anuá. Mostrar pra cada escola: "Sua inadimplência (12%) vs média do segmento (8%)", "Seu engajamento de responsáveis (65%) vs top 25% (85%)".
- **Quem tem:** Isaac (market comparison benchmarks), Sponte Analytics BI, OpenApply (admissions benchmarking).

#### 10.7 App white-label / marca da escola `P3` `[XL]`
- **Problema:** Portal tem a marca Anuá. Escola quer sua própria marca (logo, cores, domínio).
- **Fix:** Customização de logo, cor primária, e subdomínio (escola.anua.app). App mobile com branding da escola.
- **Quem tem:** Edlio (custom branded app per school), Agenda Edu (personalização de marca).

#### 10.8 API pública documentada `P2` `[L]`
- **Problema:** Escolas e parceiros não conseguem integrar com Anuá. Sem API pública.
- **Fix:** REST API documentada (Swagger/OpenAPI) com autenticação por API key. Endpoints pra alunos, matrículas, pagamentos, eventos. Webhook outgoing pra eventos.
- **Quem tem:** iScholar (API pública documentada), ClassApp (API pública), Veracross (200+ parceiros de integração), Alma (App Center com 125+ integrações push-button).

#### 10.9 Integração com Educacenso / INEP `P2` `[L]`
- **Problema:** Escola precisa preencher Educacenso anualmente. Extrai dados manualmente do sistema.
- **Fix:** Export automático no formato do Educacenso. Validação de campos obrigatórios. Alerta de dados faltantes.
- **Quem tem:** Sponte (Sponte Gov), Lyceum (census integration), Proesc (Proesc Gov — export FNDE).

---

## 11. Portal do Aluno

### Polish

#### 11.1 Dashboard do aluno sem visualização de próximas aulas `P2` `[XS]`
- **Onde:** `inertia/pages/aluno/dashboard.tsx`
- **Problema:** Dashboard mostra infos gerais mas sem "Suas aulas hoje" com horários.
- **Fix:** Card "Aulas de hoje" com disciplina, horário, professor. Dados do `ClassSchedule`.

#### 11.2 Portal sem acesso direto a notas `P2` `[S]`
- **Onde:** `inertia/pages/aluno/`
- **Problema:** Aluno vê notas pelo portal do responsável. Não tem acesso direto.
- **Fix:** Página `/aluno/notas` com visão de notas por disciplina/sub-período. Read-only.

### Evolução

#### 11.3 Segmentação de UI por tipo de aluno `P1` `[M]`
- **Onde:** `inertia/pages/aluno/*`
- **Problema:** Aluno autorresponsável (18+, técnico/faculdade) vê UI gamificada igual criança de 7 anos. Sem abas de financeiro/documentos.
- **Fix:** Backend devolve `isSelfResponsible` + `segment` no `me`. Front roteia: adulto → layout sem gamificação, com financeiro/documentos. Criança → mantém gamificado.
- **Ref:** AUDITORIA-2026-05 #2.

#### 11.4 Session timeout no portal gamificado `P0` `[S]`
- **Onde:** `inertia/pages/aluno/kids_dashboard.tsx`
- **Problema:** Criança de 7 anos deixa tablet aberto. Pode fazer compras sem supervisão.
- **Fix:** Timeout de 30min em rotas `.gamified`. Auto-redirect pra idle. Dialog de confirmação antes de gasto de pontos.
- **Ref:** AUDITORIA-2026-05 #4.

#### 11.5 Transição kids → teen → adulto `P3` `[S]`
- **Onde:** Não existe. Mudança de layout é abrupta.
- **Problema:** Aluno faz 14-15 anos e de repente a UI muda.
- **Fix:** Toast "Você desbloqueou a versão Teen" quando aluno muda de faixa. Opt-out manual em perfil.
- **Ref:** AUDITORIA-2026-05 #36.

### Competitivo

#### 11.6 Portfolio digital do aluno `P3` `[L]`
- **Problema:** Aluno não tem registro de conquistas, trabalhos, evolução ao longo dos anos.
- **Fix:** Portfolio digital por aluno: melhores trabalhos, certificados, conquistas de gamificação, evolução de notas. Compartilhável com link público (controlável pelo responsável).
- **Quem tem:** ClassDojo (student portfolios), ManageBac (evidence of learning portfolio), Transparent Classroom (visual learning diaries).

#### 11.7 Submissão de tarefas pelo portal `P2` `[M]`
- **Onde:** Assignments existem no backend mas aluno não envia pelo portal.
- **Problema:** Professor passa tarefa, aluno entrega em papel ou manda por WhatsApp.
- **Fix:** Página de tarefas pendentes no portal do aluno. Upload de arquivo/texto como resposta. Professor vê submissões e corrige no sistema.
- **Quem tem:** ManageBac, PowerSchool/Schoology, Blackbaud, Alma.

#### 11.8 Portal de ex-alunos (alumni) `P3` `[L]`
- **Problema:** Aluno forma e perde acesso. Escola perde contato com ex-alunos.
- **Fix:** Portal simplificado pra ex-alunos: histórico escolar, certificados, rede de contatos. Escola pode enviar comunicados pra alumni (eventos, arrecadação).
- **Quem tem:** Classter (alumni portal + employer portal pra matching de estágio).

---

## 12. Configurações & Integrações

### Polish

#### 12.1 Configurações da escola sem categorização `P3` `[XS]`
- **Onde:** `inertia/pages/escola/configuracoes/index.tsx`
- **Problema:** Todas as configs juntas. Conforme crescem os módulos, fica caótico.
- **Fix:** Agrupar em seções: Geral, Financeiro, Pedagógico, Comunicação, Gamificação, Integrações.

### Evolução

#### 12.2 Dashboard de integrações `P2` `[M]`
- **Onde:** Não existe. Asaas e Docuseal estão configurados mas sem visão unificada.
- **Problema:** Escola não sabe quais integrações estão ativas, se estão funcionando, quando falharam.
- **Fix:** Página `/escola/configuracoes/integracoes` com card por integração: status (ativo/inativo/erro), última sincronização, botão de teste. Integrações: Asaas, Docuseal, (futuro: WhatsApp, Google, Educacenso).

#### 12.3 Campos customizáveis por escola `P2` `[L]`
- **Onde:** Não existe.
- **Problema:** Escola quer campo "Tamanho do uniforme" no cadastro do aluno. Precisa de dev.
- **Fix:** Sistema de custom fields por entidade (Aluno, Responsável, Funcionário). Escola configura: label, tipo (texto, número, select, data), obrigatório/opcional. Valores armazenados em JSON column.

### Competitivo

#### 12.4 Integração Google Workspace / Microsoft 365 `P2` `[L]`
- **Problema:** Escola usa Google Classroom em paralelo. Duplicação de turmas, alunos, atividades.
- **Fix:** Sync bidirecional de turmas/alunos com Google Classroom. SSO via Google. Integração com Google Drive pra documentos.
- **Quem tem:** ManageBac, Classter, iSAMS (Google Classroom + MS Teams), PowerSchool (Google/Microsoft Assignments).

#### 12.5 Webhooks outgoing configuráveis `P3` `[M]`
- **Problema:** Parceiros e integrações externas não conseguem reagir a eventos do Anuá.
- **Fix:** Sistema de webhooks: escola configura URL de destino + eventos que quer receber (nova matrícula, pagamento confirmado, falta registrada). Retry com exponential backoff. Log de entregas.

#### 12.6 Integração com Zapier / Make `P3` `[M]`
- **Problema:** Escola quer automatizar coisas simples sem programação ("quando novo aluno, adicionar no Google Sheets").
- **Fix:** App no Zapier/Make com triggers (nova matrícula, pagamento, falta) e actions (criar aluno, criar comunicado). Baseado nos webhooks (#12.5).

---

## 13. Mobile & Responsividade

### Polish

#### 13.1 Cobertura responsiva ainda parcial `P1` `[L]`
- **Onde:** Estimativa: ~30% das pages têm tratamento `sm:/md:/lg:` adequado.
- **Problema:** Responsável usa celular (60-70% do tráfego). Tabelas quebram, modais não cabem, botões ficam apertados.
- **Fix:** Auditoria de responsividade nas 15 páginas mais acessadas do portal do responsável. Converter tabelas pra cards em mobile. Testar com viewport 375x812.

#### 13.2 PWA sem prompt de instalação `P2` `[S]`
- **Onde:** `public/site.webmanifest` existe, service worker implementado.
- **Problema:** PWA está configurada mas não sugere instalação pro usuário.
- **Fix:** Banner "Instalar app" no primeiro acesso mobile (after 2 visits). Persistir dismiss.

### Competitivo

#### 13.3 App nativo (iOS/Android) `P2` `[XL]`
- **Problema:** Responsáveis e alunos esperam app na loja. PWA ainda é desconhecido pela maioria.
- **Fix:** App React Native / Expo wrapping o portal. Push nativas. Ícone na App Store / Google Play.
- **Quem tem:** Todos os concorrentes relevantes (Sponte, Isaac/Meu Arco, iScholar, ClassApp, Agenda Edu, Proesc). Ausência é gap visível.

#### 13.4 App separado pra equipe escolar `P3` `[XL]`
- **Problema:** Professor usa o mesmo portal que o coordenador, sem otimização mobile pra suas tarefas (chamada, lançar nota rápida).
- **Fix:** App/PWA pra professores: tela de chamada rápida (lista de alunos com toggle presente/ausente), lançar nota, ver horário do dia. Otimizado pra tablet em sala de aula.
- **Quem tem:** Sponte (Portal do Professor PWA — multi-escola com login único), Agenda Edu (app Equipe Escolar separado).

---

## 14. Relatórios & Analytics

### Polish

#### 14.1 Analytics da escola sem drill-down `P2` `[S]`
- **Onde:** `/admin/analytics/*` e dashboards da escola.
- **Problema:** Gráficos mostram totais mas sem clicar pra ver o detalhe (ex: clicar na barra de inadimplência e ver os alunos).
- **Fix:** Implementar drill-down: clique em barra/ponto do gráfico → lista filtrada embaixo.

### Evolução

#### 14.2 Relatórios exportáveis em PDF/Excel `P1` `[M]`
- **Onde:** CSV de alunos existe (#27 da auditoria). Outros relatórios não têm export.
- **Problema:** Coordenadora precisa de relatório pra reunião de diretoria. Tira screenshot.
- **Fix:** Botão "Exportar" em todos os dashboards principais: financeiro (inadimplência, receita), pedagógico (frequência, notas), matrículas (funil). Formatos: PDF (pra apresentação) e Excel (pra manipulação).
- **Quem tem:** Todos. É table stakes.

#### 14.3 Relatório de board-ready (snapshot executivo) `P2` `[M]`
- **Problema:** Diretor quer um resumo de 1 página pra apresentar pro conselho/mantenedor.
- **Fix:** Relatório automático mensal: total de alunos, receita, inadimplência, frequência média, satisfação (se NPS implementado). PDF com branding da escola.
- **Quem tem:** Alma Beacon AI (board-ready snapshot reports).

### Competitivo

#### 14.4 BI self-service com relatórios customizados `P3` `[XL]`
- **Problema:** Coordenadora quer cruzar dados que os relatórios pré-prontos não cobrem.
- **Fix:** Builder de relatórios: selecionar entidade (alunos, pagamentos, frequência), filtros, colunas, agrupamento. Salvar como favorito. Agendar envio por email.
- **Quem tem:** Sponte Analytics BI (lançado maio 2026), Synergetic (700+ relatórios pré-prontos).

#### 14.5 Dashboards por role (cada persona vê o seu) `P2` `[M]`
- **Problema:** Coordenador financeiro e coordenador pedagógico veem o mesmo dashboard.
- **Fix:** Dashboard customizado por role: financeiro vê receita/inadimplência/projeção, pedagógico vê frequência/notas/alunos em risco, diretor vê visão consolidada.
- **Quem tem:** Classter (role-specific dashboards), Alma.

---

## 15. Experiência do Responsável (transversal)

### Polish

#### 15.1 Primeiro acesso sem orientação pós-onboarding `P2` `[S]`
- **Onde:** `OnboardingModal` existe mas é genérico.
- **Problema:** Após fechar o modal de onboarding, responsável fica perdido. Sem checklist persistente.
- **Fix:** Checklist no dashboard: "Enviar documentos", "Assinar contrato", "Pagar taxa". Marcação automática conforme completa. Desaparece quando tudo resolvido.
- **Quem tem:** FACTS (custom onboarding experience for new families).

#### 15.2 Notificações sem centro de preferências granular `P3` `[S]`
- **Onde:** Notificação existe mas sem preferências por tipo.
- **Problema:** Responsável recebe tudo ou nada. Quer desligar comunicados mas manter financeiro.
- **Fix:** Tela de preferências: toggle por categoria (financeiro, pedagógico, comunicados, eventos) × canal (push, email, WhatsApp).

### Competitivo

#### 15.3 Pesquisa de saída (exit survey) `P2` `[S]`
- **Problema:** Família transfere o filho e escola não sabe por quê. Perde insight de retenção.
- **Fix:** Ao desativar matrícula, disparar pesquisa automática pro responsável: motivo (financeiro, mudança, insatisfação, pedagógico). Agregar dados pra escola.
- **Quem tem:** Transparent Classroom (exit survey automation com departure reason tracking).

#### 15.4 NPS periódico `P2` `[M]`
- **Problema:** Escola não mede satisfação das famílias sistematicamente.
- **Fix:** Pesquisa NPS automática trimestral via push/email. Resultado no dashboard da escola com evolução temporal. Segmentação por turma/série.

#### 15.5 Carteirinha digital do aluno `P2` `[S]`
- **Problema:** Aluno perde carteirinha física. Escola gasta com reimpressão.
- **Fix:** Carteirinha digital no portal do aluno/responsável com QR code (reuso do QR de cantina). Foto, nome, turma, validade. Wallet (Apple/Google).

---

## Whitespace: oportunidades que ninguém tem

Essas são oportunidades onde a Anuá pode ser first-mover, combinando dados que nenhum concorrente tem de forma integrada:

### W1. Student Economy Unificada
Combinar gamificação + cantina + loja + financeiro em um ciclo: nota boa → pontos → resgate na cantina. Nenhum concorrente no mundo integra essas 4 dimensões.

### W2. IA nativa cross-módulo
Concorrentes aplicam IA em 1 feature (Lyceum: chatbot, Proesc: financeiro, Eduqo: correção). Anuá pode ser IA-native: previsão de matrícula + geração de comunicado + alerta de evasão + tutor do aluno + OCR de documentos, tudo conectado.

### W3. Insights preditivos com dados comportamentais de gamificação
Nenhuma plataforma cruza dados de engajamento gamificado (streak, pontos, tempo no app) com performance acadêmica pra prever evasão. Anuá tem esses dados.

### W4. Cantina/POS integrado nativamente
No mercado BR, só o Diário Escola tem cantina digital. Nenhum dos grandes (Sponte, Isaac, iScholar, Proesc, SophiA) tem. É gap estrutural do mercado.

---

## Como usar

1. Priorizar por módulo conforme demanda de clientes e roadmap.
2. Dentro de cada módulo, começar por **Polish** (rápido, impacto imediato) → **Evolução** (melhora o existente) → **Competitivo** (diferenciação).
3. Items com `[XS]`/`[S]` podem ser despachados em "uma tarde de quick wins" como fizemos na AUDITORIA-2026-05.
4. Items **Competitivo** com `[XL]` são candidatos a milestones ou sprints dedicados.
5. Referências cruzadas com AUDITORIA-2026-05 estão marcadas com `Ref:` — evitar duplicação de execução.

Última atualização: 2026-05-27.
