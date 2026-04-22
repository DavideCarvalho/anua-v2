## Contexto

A tela de novo comunicado da escola ja permite selecionar publico por:

- toda escola;
- curso;
- ano;
- turma.

Necessidade validada: adicionar envio para **alunos especificos** na mesma tela, como modo de selecao dedicado.

Decisao validada com o usuario:

- "Alunos especificos" sera um **preset exclusivo** (nao combinavel com os outros no mesmo envio).

## Objetivo

Permitir que a escola crie e publique comunicados direcionados para alunos especificos, mantendo compatibilidade com os filtros ja existentes.

Resultado esperado:

- novo preset "Alunos especificos" na tela de criacao;
- selecao de alunos por checkbox;
- persistencia da audiencia no mesmo modelo de dados atual;
- publicacao resolve destinatarios corretamente sem duplicidade.

## Abordagens consideradas

1. Reusar `SchoolAnnouncementAudience` com novo `scopeType: 'STUDENT'` (escolhida)
   - Pro: menor impacto estrutural, reaproveita fluxo atual de create/update/publish.
   - Contra: exige ampliar validacao e tipagem do escopo.

2. Criar tabela separada para audiencia por aluno
   - Pro: separacao explicita por tipo de audiencia.
   - Contra: aumenta complexidade e duplica regras.

3. Resolver alunos apenas na publicacao, sem persistir audiencia por aluno
   - Pro: mudanca de schema minima.
   - Contra: pior auditoria e inconsistencia de rascunho/edicao.

## Design tecnico

### 1) Frontend (`/escola/comunicados/novo`)

- Adicionar novo preset: **Alunos especificos**.
- Preset segue comportamento exclusivo: ao alternar, limpar selecoes anteriores.
- Quando ativo, exibir:
  - lista de alunos com checkbox;
  - acao "Limpar selecao";
  - resumo: `X aluno(s) selecionado(s)`.
- Validacao da tela:
  - salvar desabilitado sem audiencia valida;
  - mensagem de aviso quando nenhum aluno estiver selecionado.
- Lista de alunos vem de endpoint dedicado simples (`id`, `name`), podendo incluir contexto no label quando houver nomes duplicados.

### 2) API de entrada (create/update)

Adicionar campo opcional no payload:

- `audienceStudentIds: string[]`

Campos existentes permanecem:

- `audienceAcademicPeriodIds`
- `audienceCourseIds`
- `audienceLevelIds`
- `audienceClassIds`

### 3) Servico de audiencia

No servico `school_announcement_audience_service`:

- ampliar `AnnouncementAudienceInput` e `AnnouncementAudienceResolved` com `audienceStudentIds`;
- `ensureAnnouncementAudienceIsSelected` passa a considerar alunos como audiencia valida;
- `syncSchoolAnnouncementAudience` passa a persistir `scopeType: 'STUDENT'`;
- `resolveAnnouncementAudienceConfig` passa a retornar ids de aluno;
- `validateAudienceIds` valida se os alunos pertencem a escola;
- `resolveAudienceStudentIds` inclui `audienceStudentIds` no `Set` final (sem duplicidade), mantendo comportamento atual dos demais filtros.

### 4) Modelo e tipagem

No modelo `SchoolAnnouncementAudience`:

- ampliar union de `scopeType` para incluir `STUDENT`.

Se houver restricao de enum/check no banco para `scopeType`, atualizar migracao correspondente para aceitar `STUDENT`.

### 5) Controllers

Nos controllers de create/update de comunicado:

- repassar `audienceStudentIds` para `syncSchoolAnnouncementAudience`.

## Regras de negocio

- "Alunos especificos" funciona como preset dedicado (sem combinacao com os demais no mesmo envio pela UI).
- Publicacao continua usando resolvedor unico de destinatarios.
- Deduplicacao de alunos permanece garantida por `Set` na resolucao de audiencia.

## Testes

1. Browser/UI
   - verificar botao "Alunos especificos" nos presets;
   - verificar exibicao da lista de alunos;
   - verificar habilitacao/desabilitacao do salvar com base na selecao.

2. API/servico
   - create/update aceitam `audienceStudentIds`;
   - erro para aluno fora da escola;
   - publicacao com alvo por aluno gera destinatarios esperados sem duplicidade.

3. Regressao
   - fluxos atuais (toda escola, curso, ano, turma) sem alteracao funcional.

## Rollout

1. Backend: validadores, servico, model e controllers.
2. Endpoint de listagem de alunos para a tela.
3. Frontend do novo preset.
4. Testes de regressao e ajuste final.

## Fora de escopo

- combinacao de "alunos especificos" com outros presets na mesma submissao;
- segmentacao avancada por criterios compostos alem do preset dedicado.
