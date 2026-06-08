# Segmentação de UI do aluno autorresponsável (#2)

**Data:** 2026-05-28
**Auditoria:** item #2 (P0, risco). `AUDITORIA-2026-05.md`.

## Problema

Um **aluno autorresponsável** (`Student.isSelfResponsible`) é um aluno 18+ que assume o próprio papel de responsável — só permitido em segmentos `TECHNICAL`/`UNIVERSITY`/`OTHER` (CONTEXT.md). Hoje ele tem role `STUDENT` e:

1. **Fica trancado fora dos próprios dados financeiros/documentais.** Pagamentos, documentos, notas, autorizações e comunicados vivem sob `/api/v1/responsavel/*`, com checagem IDOR via `StudentHasResponsible`. O aluno autorresponsável não tem linha apontando pra si mesmo → a checagem falha. As rotas de página `/responsavel/*` são role-gated (RESPONSIBLE/STUDENT_RESPONSIBLE), que ele não tem.
2. **Sem segmentação explícita de experiência.** O gate de gamificação é só por idade (`age <= 14`). Um autorresponsável é 18+, então já cai no layout não-gamified — mas não há trava explícita por `isSelfResponsible`.

**Não-problemas (confirmados):** as rotas de API `/responsavel/*` NÃO são role-gated (só `auth` + `impersonation`, `start/routes/api/responsavel.ts:186`) — a única proteção é a checagem IDOR por controller, que é sólida. Não há buraco de IDOR a corrigir; o objetivo é habilitar acesso legítimo mantendo a checagem intacta.

## Decisão

Manter o aluno autorresponsável em `/aluno` (sem gamificação) e adicionar as capacidades do lado responsável, alimentadas pelo mesmo stack `/responsavel`, desbloqueado por um **self-link** em `StudentHasResponsible`.

Nota de modelo: o PK de `Student` é o mesmo do `User` (`Student.find(user.id)` em `inertia_middleware.ts:80`), logo `studentId === userId` e o self-link é uma linha onde `studentId === responsibleId`.

### Backend

1. **Helper `resolveSelfResponsibleContext(user)`** — deriva `{ isSelfResponsible, segment, studentId }`: busca `Student` por `user.id`, lê `isSelfResponsible`, e o `segment` via `StudentHasLevel → AcademicPeriod`. Retorna nulos quando o user não é aluno. Chamado nos dois pontos que montam o payload do usuário: `app/controllers/auth/me.ts` e `app/middleware/inertia_middleware.ts`.

2. **Expor os campos:**
   - `app/models/dto/user.dto.ts`: `isSelfResponsible: boolean`, `segment: AcademicPeriodSegment | null`, `studentId: string | null`.
   - `app/transformers/user_transformer.ts`: mesmos campos (payload REST/Tuyau).
   - `inertia/lib/types.ts`: mesmos campos no tipo `UserDto` do frontend.

3. **Gate de gamificação (defense-in-depth):** em `inertia_middleware.ts`, `gamified = isGamifiedStudent(...) && !student.isSelfResponsible`. O threshold de idade (`<= 14`) **não muda** — a transição abrupta 14→15 é o item #36 (P3), fora de escopo.

4. **Self-link em `StudentHasResponsible`:**
   - **Hook na matrícula online:** quando `isSelfResponsible` é marcado na submissão, criar (idempotente) a linha `{ studentId, responsibleId: studentId, isPedagogical: true, isFinancial: true }`.
   - **Comando de backfill** (`backfill:self-responsible-links`): pros alunos autorresponsáveis existentes sem self-link. Idempotente, logável.
   - **Efeito colateral assumido e desejado:** o aluno passa a receber notificações e comunicados endereçados a responsável — correto, ele exerce o papel.

### Frontend

Em `inertia/components/layouts/aluno-layout.tsx`, quando `user.isSelfResponsible`, renderizar um **novo `SidebarGroup` "Minha Conta"** após o grupo "Menu" existente (paleta adulta, item ativo `bg-primary/10` conforme DESIGN.md), com:

| Item         | Rota                  | Container reusado                       |
| ------------ | --------------------- | --------------------------------------- |
| Financeiro   | `/aluno/financeiro`   | `StudentPaymentsContainer`              |
| Documentos   | `/aluno/documentos`   | container de documentos do responsável  |
| Autorizações | `/aluno/autorizacoes` | `autorizacoes` (#30)                    |
| Matrícula    | `/aluno/matricula`    | `matricula-axes-container` (#9)         |
| Comunicados  | `/aluno/comunicados`  | container de comunicados do responsável |

Novas páginas Inertia `/aluno/*` que renderizam os containers existentes do responsável passando `studentId = user.studentId`. **Zero mudança nos containers ou na API** — o self-link faz a checagem IDOR passar. Novas rotas registradas no grupo `/aluno` (`start/routes/pages/aluno.ts`), que já usa `auth` + `impersonation`.

O grupo "Menu" existente (Início + loja/idle) permanece — o autorresponsável continua sendo aluno. As views de aluno (notas, horário) que ele já tem não são duplicadas.

## Verificação

- Backfill cria self-links idempotentemente; rodar 2x não duplica.
- Aluno autorresponsável de teste: o grupo "Minha Conta" aparece; Financeiro/Documentos/Autorizações/Matrícula/Comunicados carregam os próprios dados (HTTP 200, não 403).
- `gamified === false` garantido pra ele (mesmo forçando birthDate nulo).
- Aluno comum (criança ≤14): não vê "Minha Conta", segue gamified. Aluno 15+ não-autorresponsável: não vê "Minha Conta" (não é responsável de si), segue não-gamified.
- Aluno autorresponsável NÃO consegue acessar dados de OUTRO aluno (a checagem IDOR continua valendo — self-link é só pra si mesmo).
- `node ace migration:run` n/a (sem schema novo); typecheck verde backend + frontend.

## Fora de escopo

- Não criar role nova (mantém `STUDENT`).
- Não tocar nas rotas de página `/responsavel/*` (seguem role-gated).
- Threshold de idade e transição teen (#36).
- Tier "teen" intermediário; `kids_dashboard.tsx` órfão fica como está.
