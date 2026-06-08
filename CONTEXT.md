# Anuá

Plataforma de gestão escolar para escolas de educação básica no Brasil. Este arquivo é o glossário do domínio — define os termos que o time usa para falar do produto.

## Language

### Matrícula

**Matrícula**:
Vínculo de um aluno a um nível (turma/série) num período letivo específico — uma linha em `StudentHasLevel`. Cada novo período gera uma nova **Matrícula** para o mesmo aluno.
_Avoid_: "Inscrição", "Cadastro do aluno" (isso é o **Aluno**, que existe independente da matrícula)

**Matrícula Online**:
Fluxo público em `/matricula-online/:school/:period/:course` em que o **Responsável** (ou **Aluno Autorresponsável**) preenche os dados essenciais, e a partir daí o resto do trabalho (envio de documentos, assinatura, pagamento da taxa) acontece dentro do **Portal do Responsável** após autenticação por OTP. O link de cada (Escola × Período × Curso) é público enquanto a **Janela de Matrícula** do **Período Letivo** estiver aberta — não há "publicar curso" como ação separada; o controle vive no Período.
_Avoid_: "Inscrição online", "Cadastro online"

**Janela de Matrícula**:
Intervalo `[AcademicPeriod.enrollmentStartDate, AcademicPeriod.enrollmentEndDate]` durante o qual o link público de **Matrícula Online** aceita submissões. Fora desse intervalo, ou quando `isActive = false` ou `isClosed = true`, o link retorna estado de "matrículas fechadas". Datas nulas significam "sem janela definida" (comportamento atual: aceita sempre).

**Pendência**:
Algo que ainda precisa acontecer para a **Matrícula** ser considerada concluída. Pendências existem em **eixos independentes** (ver Relationships) — não há um status linear único.
_Avoid_: "Status", "Etapa" (sugerem ordenação que não existe)

**Aluno**:
Pessoa que estuda; existe como `Student` independente de ter **Matrícula** ativa. Um **Aluno** pode ter várias **Matrículas** ao longo do tempo.

**Responsável**:
Pessoa adulta vinculada ao **Aluno** com papéis: pedagógico (recebe comunicados), financeiro (recebe cobranças), contato de emergência. Um **Aluno** pode ter vários **Responsáveis**; um **Responsável** pode cobrir vários alunos.
_Avoid_: "Pai/Mãe" (nem sempre é o caso — pode ser tio, avó, tutor legal), "Guardian"

**Aluno Autorresponsável** (`isSelfResponsible`):
**Aluno** maior de idade que assume seu próprio papel de **Responsável**. Só permitido quando o **Segmento** do **Período Letivo** é `TECHNICAL`, `UNIVERSITY` ou `OTHER` **e** o **Aluno** tem 18+ anos. Em **Educação Básica** (`KINDERGARTEN`/`ELEMENTARY`/`HIGHSCHOOL`), o form público de **Matrícula Online** é **sempre** preenchido por um **Responsável**, independente da idade do aluno (ex: aluno de 18 anos no 3º ano do Ensino Médio ainda é matriculado pelo Responsável).
_Avoid_: "Aluno adulto" (idade ≥18 não basta — segmento também conta)

**Segmento** (`AcademicPeriodSegment`):
Faixa de educação de um **Período Letivo**: `KINDERGARTEN` (Educação Infantil), `ELEMENTARY` (Fundamental), `HIGHSCHOOL` (Médio), `TECHNICAL` (Técnico), `UNIVERSITY` (Superior), `OTHER`. Os três primeiros formam a **Educação Básica**.
_Avoid_: "Nível" (isso é `Level`/turma/série, conceito diferente)

**Contrato**:
Modelo de cobrança e cláusulas atrelado a um **Nível**. Define mensalidade, taxa de matrícula, parcelamento, descontos e quais **Documentos Contratuais** são exigidos. Uma **Matrícula** herda os termos do **Contrato** do seu **Nível**.

**Documento Contratual**:
Tipo de documento exigido pelo **Contrato** para uma **Matrícula** (ex: RG, comprovante de residência). Cada exigência vira uma `ContractDocument` no banco. É um _slot_ — não é o arquivo enviado.
_Avoid_: "Arquivo", "Anexo" (genéricos demais)

**Submissão de Documento** (`StudentDocumentSubmission`):
A entrega de um **Documento Contratual** específico por parte do **Responsável** — a unidade que a secretaria revisa. Carrega o `status` (`PENDING`/`APPROVED`/`REJECTED`), `rejectionReason`, `reviewedBy`, `submittedAt`. Uma **Submissão** pode conter **um ou mais Arquivos de Documento** (ex: RG frente + verso). Quando rejeitada e o **Responsável** reenviar, a mesma **Submissão** é **substituída** (status volta a `PENDING`, arquivos antigos descartados — histórico não preservado).

**Arquivo de Documento** (`StudentDocumentFile`):
Cada arquivo físico (PDF, JPG, PNG) que compõe uma **Submissão de Documento**. Múltiplos arquivos por **Submissão** são suportados (1:N). Armazenado em disco **privado** (`@adonisjs/drive` com `visibility: 'private'`); acesso só via URLs assinadas com expiração curta.
_Avoid_: confundir com **Submissão** (Submissão é a unidade revisada; Arquivo é o blob físico)

**Assinatura do Contrato**:
Coleta de assinaturas digitais do contrato gerado pela **Matrícula**. Status em `studentHasLevel.docusealSignatureStatus`. Provider hoje é Docuseal, mas a abstração deve permitir troca.
_Avoid_: "Assinatura" sozinho (ambíguo com assinatura de presença, comunicados, etc.)

**Taxa de Matrícula** (`Contract.enrollmentValue`):
Cobrança única paga **no ato da matrícula** (ou em curto prazo definido pela escola via `Contract.enrollmentPaymentUntilDays`) — é a única cobrança que bloqueia a **Matrícula**. Quando `enrollmentValue = 0` ou null, o eixo Pagamento da matrícula simplesmente **não existe**.
_Avoid_: "1ª parcela" (ambíguo com 1ª mensalidade)

**Prazo da Taxa** (`Contract.enrollmentPaymentUntilDays`):
Quantos dias após a criação da **Matrícula** a **Taxa de Matrícula** pode ser paga sem ficar em atraso. Nullable — null significa "sem prazo definido" (taxa só fica `PENDING` indefinidamente, nunca `OVERDUE`). Configurável por **Contrato** porque escolas têm políticas diferentes ("no ato", "até 30 dias", etc.).

**Matrícula Abandonada**:
**Matrícula** cuja **Taxa de Matrícula** ficou `OVERDUE` há mais de N dias **e** não houve progresso nos outros eixos. Não é um estado persistido — é filtro derivado na lista da secretaria. A **Matrícula** continua existindo (não é auto-deletada); secretaria decide manualmente arquivar.
_Avoid_: "Matrícula expirada" (sugere auto-expiração que não acontece)

**Mensalidade** (`Contract.ammount` — typo histórico no schema, é "amount"):
Cobrança recorrente do aluno **já matriculado**. **Não bloqueia** a conclusão da **Matrícula** — uma matrícula concluída pode ter mensalidades futuras pendentes; isso é assunto do módulo financeiro, não da matrícula.
_Avoid_: "Parcela" (genérico demais), confundir com **Taxa de Matrícula**

**Alocação de Turma**:
Atribuição do **Aluno** a uma `Class` específica dentro do **Nível** da **Matrícula**. É trabalho **da secretaria**, não da família — mas conta como **Pendência** porque uma matrícula sem turma não está operacionalmente pronta (não entra em diário, frequência, etc.).

## Relationships

- Um **Aluno** tem zero ou mais **Matrículas** (uma por período letivo).
- Uma **Matrícula** pertence a exatamente um **Aluno** e a um **Nível**.
- Uma **Matrícula** herda os termos do **Contrato** do seu **Nível**.
- Uma **Matrícula** está concluída quando **todos os eixos de Pendência aplicáveis** estão resolvidos:
  - **Documentação**: todos os **Documentos Contratuais** obrigatórios têm uma **Submissão** com `status = APPROVED`
  - **Assinatura**: `docusealSignatureStatus = COMPLETED`
  - **Pagamento** (apenas se `Contract.enrollmentFee > 0`): **Taxa de Matrícula** com `StudentPayment.status = PAID`. Se taxa = 0, este eixo não se aplica e não conta.
  - **Alocação de Turma**: `StudentHasLevel.classId` preenchido (trabalho da secretaria, não da família)
- Esses eixos avançam **independentes entre si** — não há ordem imposta. A "matrícula concluída" é a conjunção dos eixos aplicáveis, calculada no read-side, não persistida.

## Example dialogue

> **Dev:** "A família X preencheu o formulário mas só mandou 2 dos 4 documentos. Qual é o status da **Matrícula**?"
> **Domain expert:** "Não fala em 'status'. A **Matrícula** tem três **Pendências**: documentação parcial (2 de 4 aprovados), assinatura pendente, primeiro pagamento pendente. Cada uma anda no seu eixo. A secretaria vê os três badges; a família vê 'o que falta de você'."

## Flagged ambiguities

- "Status da matrícula" foi usado para significar várias coisas distintas — resolvido: cada **Pendência** tem seu próprio estado; "matrícula concluída" é derivada, não armazenada num enum único. O enum `EnrollmentStatus` (`PENDING_DOCUMENT_REVIEW` / `REGISTERED`) hoje no banco é insuficiente e está marcado para revisão.
