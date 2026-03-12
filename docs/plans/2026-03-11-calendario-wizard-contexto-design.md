# Design: Wizard de contexto para criacao de atividade/prova no Calendario Pedagogico

## Problema

Hoje, ao criar atividade ou prova com turma em `ALL`, o fluxo bloqueia com toast pedindo selecao de turma fora do modal.
Isso quebra o fluxo e nao respeita o comportamento esperado para cada perfil (diretor, coordenador, professor).

## Objetivo

Permitir criacao de atividade/prova diretamente no modal, mesmo com turma `ALL`, usando um wizard de contexto com regras de acesso por perfil e fonte de verdade da grade real.

## Escopo funcional

- Implementar wizard em `NewAssignmentModal` e `NewExamModal`.
- Etapa 1 (contexto): `Periodo letivo -> Curso/Serie -> Turma -> Materia`.
- Etapa 2 (conteudo): campos atuais de atividade/prova.
- Quando `classId` ja vier preenchido, pular etapa de contexto.
- Quando `classId` vier vazio (`ALL`), etapa de contexto obrigatoria.

## Regras de acesso

### Diretor/Admin

- Pode selecionar qualquer opcao disponivel.

### Coordenador

- Pode selecionar apenas opcoes no escopo que coordena.

### Professor (regra aprovada)

- Nao usar apenas `TeacherHasClass.isActive`.
- Usar somente contextos ligados a:
  - `TeacherHasClass` do professor,
  - `AcademicPeriod.isActive = true`,
  - `Calendar` ativo e nao cancelado do periodo/turma,
  - `CalendarSlot` com `teacherHasClassId` correspondente.
- Aulas reais devem vir da grade (`CalendarSlot`) do calendario ativo.

## Fonte de verdade dos dados

- Grade valida: `Calendar` + `CalendarSlot`.
- Vinculo pedagogico: `TeacherHasClass`.
- Filtros de periodo ativo: `AcademicPeriod.isActive = true`.
- Se nao houver slot valido no periodo/calendario, nao oferecer opcao ao professor.

## Comportamento de UX

- Modal com progresso em duas etapas.
- Botao `Proximo` habilita so com contexto completo.
- Botao `Salvar` apenas na etapa de conteudo.
- Loading por select (skeleton/spinner leve).
- Empty states claros por perfil:
  - Ex.: "Nenhuma turma disponivel para seu perfil neste periodo."

## Contratos e payload

- Payload final de atividade/prova continua com:
  - `classId`
  - `subjectId`
  - `teacherId`
  - datas/campos especificos (`dueDate`/`scheduledDate`, etc.)
- `teacherId` deve ser resolvido da relacao valida turma+materia no escopo filtrado.

## Riscos

- Duplicidade de opcoes quando houver multiplos slots para mesma materia.
- Custo de query em joins de calendario/slots se nao houver agregacao adequada.
- Divergencia entre modal de atividade e prova se a logica nao for compartilhada.

## Mitigacoes

- Normalizar lista por chave unica (`classId + subjectId + teacherId`).
- Criar camada compartilhada para resolver opcoes de contexto.
- Reaproveitar os mesmos filtros e validacoes nos dois modais.

## Criterios de aceite

- Com turma `ALL`, atividade e prova abrem wizard sem toast de bloqueio.
- Professor so enxerga opcoes com `CalendarSlot` valido em periodo ativo e calendario ativo.
- Diretor/coordenador seguem regras de escopo definidas.
- Fluxo de criacao conclui com sucesso nos dois modais.
- Sem regressao quando `classId` ja vier definido.
