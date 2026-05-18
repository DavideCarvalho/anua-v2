---
status: accepted
---

# Lifecycle de Matrícula Incompleta: Sinaliza, Não Expira

Matrículas que ficam paradas (família submete o form, recebe OTP, mas nunca volta — ou volta parcial e abandona) precisam de uma política. Sem nenhuma, secretaria vê listas crescendo indefinidamente com "matrículas em andamento" e não consegue distinguir "família que começou ontem" de "família que abandonou há 4 meses". Por outro lado, auto-expirar é arriscado: famílias brasileiras frequentemente pagam em janeiro, somem por dois meses, voltam em março — e descobrir que os dados sumiram é péssima UX, além de carregar LGPD se a expiração for "purge".

Decisão: **não há auto-expiração de matrícula**. Em vez disso, o eixo Pagamento ganha um estado `OVERDUE` quando a **Taxa de Matrícula** passa do prazo configurado em `Contract.enrollmentPaymentUntilDays` (coluna que **já existe** no schema, nullable — null significa "sem prazo definido"). UI da secretaria mostra a cor diferente; "Matrícula Abandonada" vira filtro derivado na lista (`Pagamento = OVERDUE há mais de N dias E sem progresso nos outros eixos`), não um estado persistido. Arquivamento é decisão humana.

## Estados do eixo Pagamento

- `PAID` — `StudentPayment` da taxa existe e tem `status = PAID`. Eixo verde.
- `PENDING` — devida, dentro do prazo. Eixo amarelo. Lembrete 2 dias antes do vencimento.
- `OVERDUE` — passou do prazo. Eixo vermelho. Lembrete reforçado; após N dias sem ação, secretaria pode filtrar como "abandonada".
- N/A — `Contract.enrollmentValue = 0` ou null. Eixo não se aplica, não aparece na UI.

## Considered Options

- **Auto-expirar matrículas paradas há 30+ dias** (soft delete ou status `EXPIRED`). Rejeitado: (i) LGPD exige consentimento pra purge automático; (ii) caso comum de "família volta meses depois" gera UX feia ("seus dados sumiram"); (iii) vaga não fica artificialmente bloqueada — escolas hoje não trabalham com hard cap de vagas no anua-v2.
- **Não fazer nada (status quo)** — matrículas vivem pra sempre sem distinção visual. Rejeitado: é exatamente a dor que originou a revisão de matrícula (`CONTEXT.md`, ADR-0001) — "tá difícil saber o que falta fazer".

## Consequences

- `Contract.enrollmentPaymentUntilDays` já existe (nullable) — não precisa de migration. Quando null, eixo nunca fica OVERDUE; quando setado, prazo é respeitado.
- Cálculo do estado do eixo Pagamento passa a depender de uma data computada (`createdAt + enrollmentPaymentUntilDays`). Pode entrar na query agregada como `CASE WHEN ... THEN 'OVERDUE' WHEN ... THEN 'PENDING' ELSE 'PAID' END`.
- Notificação evento 4 (lembrete) dispara 2 dias antes do vencimento e novamente após overdue.
- Lista da secretaria ganha filtro "Abandonadas" — query: pagamento OVERDUE há mais de N dias (configurável, ex: 30) E todos os outros eixos sem progresso desde o início.
- Sem ferramenta de archive automático no MVP; secretaria precisa de ação manual futura (botão "arquivar matrícula" → soft delete). Não bloqueia este ADR.
