---
status: accepted
---

# Progresso de Matrícula como Eixos Paralelos Independentes

O `Student.enrollmentStatus` atual (`PENDING_DOCUMENT_REVIEW` / `REGISTERED`) é um enum binário que tenta resumir num campo só algo que tem múltiplas dimensões independentes — documentação, assinatura, pagamento, alocação de turma. Isso torna impossível responder "o que falta nessa matrícula?" sem inferir de várias tabelas, e força estados artificiais quando algo está parcialmente pronto.

Decisão: **uma Matrícula tem quatro eixos de Pendência que avançam de forma independente** — Documentação, Assinatura, Pagamento (condicional) e Alocação de Turma. Cada eixo tem seu próprio estado em sua própria tabela, e "matrícula concluída" é a conjunção dos eixos aplicáveis, **calculada no read-side** (uma query SQL agregada para a lista da secretaria, preloads ricos para a tela de detalhe), nunca persistida.

## Os quatro eixos

| Eixo | Fonte da verdade | "Resolvido" quando |
|---|---|---|
| **Documentação** | `StudentDocumentSubmission.status` por slot, contado contra `ContractDocument.required` | Todos os `ContractDocument` com `required = true` têm uma `StudentDocumentSubmission` correspondente com `status = APPROVED` |
| **Assinatura** | `StudentHasLevel.signature_status` (enum interno normalizado) | `signature_status = COMPLETED` |
| **Pagamento** (condicional) | `StudentPayment.status` da Taxa de Matrícula + prazo de `Contract.enrollmentPaymentUntilDays` | Se `Contract.enrollmentValue > 0`: estado `PAID` (taxa paga), `PENDING` (devida, dentro do prazo) ou `OVERDUE` (passou do prazo sem pagar — só aplicável se `enrollmentPaymentUntilDays` não for null). Eixo "verde" só quando `PAID`. Se `enrollmentValue = 0` ou null: eixo não se aplica |
| **Alocação de Turma** | `StudentHasLevel.classId` | `classId` preenchido |

Mensalidades (`monthlyFee`) **não bloqueiam** matrícula — são cobranças recorrentes do aluno já matriculado, problema do módulo financeiro.

## Considered Options

- **Enum linear único** (`RASCUNHO → DOCS_PENDENTES → AGUARDANDO_ASSINATURA → AGUARDANDO_PAGAMENTO → MATRICULADO`). Rejeitado: a realidade não é linear — família pode assinar antes de enviar todos os docs, pagamento pode chegar antes da revisão. Forçar ordem cria estados artificiais (`ASSINADO_COM_DOC_REJEITADO`, `DOCS_PARCIAIS_AGUARDANDO_ASSINATURA`...) e explosão combinatória. Era o modelo do legado school-super-app e é exatamente a dor que motivou esta decisão.

- **Colunas materializadas em `StudentHasLevel`** (`docs_approved_count`, `signature_done`, `first_payment_paid`, `class_allocated`) atualizadas via observers/listeners. Rejeitado: cria fonte permanente de bug por dessincronização (alguém atualiza `StudentDocument.status` direto no banco e o resumo mente); precisa de invalidation logic; não economiza esforço porque a query de agregação inicial seria escrita de qualquer jeito. Reconsiderar se medirmos dor real de performance em listas com 5–10k+ matrículas.

- **Materialized view PostgreSQL**. Adiado, não rejeitado. Vira o caminho de escape se a query agregada começar a doer. Refresh policy e trigger pra refresh ficam pra quando precisar.

## Consequences

- `Student.enrollmentStatus` enum atual fica obsoleto. Migrar pra computar a partir dos eixos; eventualmente remover a coluna.
- Lista de matrículas (`list_enrollments_controller.ts`) precisa parar de fazer preload completo de documentos por aluno; vira uma query agregada com `GROUP BY studentHasLevelId` e `COUNT(...) FILTER (WHERE ...)`.
- Detalhe de matrícula continua com preloads ricos — eixos paralelos não impactam UI de detalhe.
- "Filtro de pendentes" na lista vira expressão SQL sobre os eixos, não filtro em coluna única.
- Adicionar um quinto eixo no futuro (ex: aprovação pedagógica para escolas que façam entrevista) é aditivo — nova tabela/coluna + agregar na query; sem mexer nos outros eixos.
- ADR-0002 cobrirá a abstração de provider de assinatura (interface `SignatureProvider`, schema rename `docuseal_*` → `external_*` + `signature_provider`) — pendente de pesquisa de providers.
