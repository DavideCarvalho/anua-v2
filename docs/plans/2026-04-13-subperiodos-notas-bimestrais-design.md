# Sub-Períodos de Notas (Bimestral/Trimestral/Semestral)

**Data:** 2026-04-13  
**Status:** Aprovado

## Problema

Atualmente o Anuá modela o período letivo (`AcademicPeriod`) como um bloco inteiro (ex: "2025"). Não existe subdivisão em bimestres, trimestres ou semestres. Notas de provas e trabalhos ficam "soltas" no período letivo, sem pertencer a um sub-período. Escolas que usam notas bimestrais/trimestrais/semestrais não conseguem organizar nem calcular notas por sub-período.

## Decisão de Design

**Abordagem A: Modelo `AcademicSubPeriod` novo** — Cria uma entidade de primeira classe para sub-períodos. Design limpo, seguro para produção (dados existentes continuam funcionando), e permite relações adequadas com notas.

## Modelo de Dados

### Novo enum `PeriodStructure` (adicionado em School)

```
BIMESTRAL  → 4 sub-períodos por ano
TRIMESTRAL → 3 sub-períodos por ano
SEMESTRAL   → 2 sub-períodos por ano
```

Campo `periodStructure` (nullable) adicionado em `School`. Quando `null`, a escola não usa sub-períodos — compatibilidade reversa total.

### Novo modelo `AcademicSubPeriod`

| Campo             | Tipo                       | Descrição                                       |
| ----------------- | -------------------------- | ----------------------------------------------- |
| id                | text (PK, UUID v7)         | Primary key                                     |
| name              | text                       | "1º Bimestre", "2º Trimestre", etc.             |
| slug              | text (unique)              | Auto-gerado                                     |
| order             | integer                    | 1, 2, 3, 4 — ordenação                          |
| startDate         | date                       | Início do sub-período                           |
| endDate           | date                       | Fim do sub-período                              |
| weight            | float (default: 1)         | Peso para média ponderada                       |
| minimumGrade      | float (nullable)           | Nota mínima no sub-período (override da escola) |
| hasRecovery       | boolean (default: false)   | Se tem recuperação neste sub-período            |
| recoveryStartDate | date (nullable)            | Início do período de recuperação                |
| recoveryEndDate   | date (nullable)            | Fim do período de recuperação                   |
| academicPeriodId  | text (FK → AcademicPeriod) | Período letivo pai                              |
| schoolId          | text (FK → School)         | Escola                                          |
| deletedAt         | timestamp (nullable)       | Soft delete                                     |

**Relações:**

- `belongsTo` → `AcademicPeriod`
- `belongsTo` → `School`
- `hasMany` → `Exam` (via `subPeriodId`)
- `hasMany` → `Assignment` (via `subPeriodId`)

### Modificações em modelos existentes

- `School` → adiciona `periodStructure` (enum PeriodStructure, nullable)
- `School` → adiciona `recoveryGradeMethod` (enum: `AVERAGE`, `REPLACE_IF_HIGHER`, `REPLACE`, nullable, default: `AVERAGE`)
- `Exam` → adiciona `subPeriodId` (text, nullable, FK → AcademicSubPeriod)
- `Assignment` → adiciona `subPeriodId` (text, nullable, FK → AcademicSubPeriod)
- `StudentHasAssignment` → adiciona `recoveryGrade` (float, nullable), `recoveryGradeDate` (timestamp, nullable)
- `ExamGrade` → adiciona `recoveryGrade` (float, nullable), `recoveryGradeDate` (timestamp, nullable)

> **Nota:** Todos os novos campos são nullable. Dados existentes continuam funcionando sem sub-período.

## Criação dos Sub-Períodos

Quando uma escola com `periodStructure` configurado cria um `AcademicPeriod`, o sistema **sugere** automaticamente os sub-períodos:

- **BIMESTRAL**: Divide `startDate`→`endDate` em 4 partes iguais
- **TRIMESTRAL**: Divide em 3 partes iguais
- **SEMESTRAL**: Divide em 2 partes iguais

Nomes gerados automaticamente ("1º Bimestre", "2º Bimestre", etc.) mas editáveis. Datas também editáveis.

**Importante:** Sub-períodos são criados por ação do usuário (botão "Gerar sub-períodos") ou no fluxo de criação do período letivo, **nunca automaticamente sem confirmação**. Escolas sem `periodStructure` não veem essa opção.

Pesos: todos sub-períodos recebem `weight: 1` por padrão (média simples). A escola pode editar individualmente para média ponderada.

## Cálculo de Notas

### Nota por Sub-Período

Para cada aluno em cada matéria, por sub-período:

- Nota do sub-período = média das provas/trabalhos desse sub-período (usando `calculationAlgorithm` da escola: AVERAGE ou SUM)
- Provas/trabalhos sem `subPeriodId` são calculadas com a lógica atual (sem sub-período)

### Nota Final do Período Letivo

- Média final = soma(`nota_sub_período_i × peso_i`) / soma(`peso_i`)
- Se todos os pesos são 1, vira média simples
- Respeita `minimumGrade` da escola (ou override do AcademicPeriod/SubPeriod)

### Recuperação por Sub-Período

Se `hasRecovery = true` no sub-período, o aluno abaixo de `minimumGrade` pode ter nota de recuperação.

Modelo de recuperação (configurável via `recoveryGradeMethod` na School):

- **AVERAGE**: `(nota_original + nota_recuperação) / 2`
- **REPLACE_IF_HIGHER**: Usa a maior das duas notas
- **REPLACE**: Substitui a nota original pela de recuperação

Campos adicionados em `StudentHasAssignment` e `ExamGrade`:

- `recoveryGrade` (float, nullable)
- `recoveryGradeDate` (timestamp, nullable)

### Status do Aluno por Sub-Período

- `APPROVED` — nota >= minimumGrade
- `IN_RECOVERY` — nota < minimumGrade e tem recuperação disponível
- `RECOVERED` — estava abaixo mas passou na recuperação
- `FAILED` — nota < minimumGrade e sem recuperação ou não passou

## Compatibilidade e Migração

1. **`periodStructure` nullable em School** — Escolas existentes ficam com `null`, não usam sub-períodos. Zero impacto.

2. **`subPeriodId` nullable em Exam/Assignment** — Provas já criadas ficam com `null`. Cálculo existente funciona igual.

3. **Migração aditiva** — Novos campos, sem drops, sem renames. Tudo nullable com defaults.

4. **Lógica de cálculo bifurcada:**
   - Escola COM `periodStructure`: calcula média por sub-período → média final ponderada
   - Escola SEM `periodStructure`: calcula como hoje (média/soma direta do período letivo inteiro)

5. **Boletim/relatórios** — Escolas sem sub-períodos veem boletim como hoje. Escolas com sub-períodos veem notas organizadas por bimestre/trimestre/semestre.

6. **Seed/Suggestion** — Quando escola configura `periodStructure` pela primeira vez, oferecer wizard: "Gerar sub-períodos para o período letivo atual?" com datas sugeridas.

## Escopo Não Incluído (YAGNI)

- Sub-períodos dentro de sub-períodos (ex: unidade dentro de bimestre)
- Recuperação final (além da recuperação por sub-período)
- Regras de aprovação baseadas em frequência por sub-período
- Integração com calendário/horários por sub-período
