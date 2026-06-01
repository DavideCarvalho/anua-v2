---
status: accepted
---

# Handoff do Form Público pro Portal do Responsável

O form público de **Matrícula Online** hoje é one-shot: POST cria entidades básicas e termina com mensagem "aguarde análise dos documentos" — mas nenhum upload de documento é coletado, nenhuma submission é criada no provider de assinatura, nenhuma notificação é enviada, e o responsável não tem como acessar nada depois. A família fica no escuro até alguém da escola contatá-la manualmente. Ao mesmo tempo, o **Portal do Responsável** (`/responsavel/*`) já existe com 19 controllers e 19 páginas para a vida cotidiana do aluno matriculado (notas, mensalidades, comunicados, documentos read-only).

Decisão: **o form público vira a porta de entrada mínima; todo o resto do trabalho de conclusão da matrícula vive no Portal do Responsável autenticado**. O form coleta dados essenciais (Aluno, Responsável, Endereço, escolha de Nível/Contrato), e o Portal hospeda o resto (upload de documentos, assinatura, pagamento da taxa, status dos 4 eixos). A ponte é autenticação por **OTP via e-mail** — infraestrutura que já existe em `app/controllers/auth/send_code.ts` (com bloqueio etário de menores de 14 anos, coerente com o fato de que sempre é um Responsável adulto que entra).

## Fluxo decidido

```
POST /matricula-online/finish
  1. Valida síncrono: janela de matrícula aberta (AcademicPeriod.enrollmentStartDate/EndDate),
     dados do form, segmento × idade pra regra de Aluno Autorresponsável
  2. Transaction:
     - Cria/atualiza User do Responsável (autenticável via OTP no email dele)
     - Cria/atualiza User do Aluno + Student
     - Cria StudentHasLevel (vínculo da Matrícula)
     - Cria StudentDocumentSubmission placeholders (status=PENDING, sem File ainda)
       para cada ContractDocument exigido pelo Contrato
  3. Síncrono (mas curto, <500ms): dispatch OTP por e-mail pro Responsável
  4. Enfileira jobs (async, retry policy automática):
     - CreateSignatureSubmissionJob (provider TBD — ver ADR-0002 quando escrito)
     - NotifySchoolStaffJob (secretaria sabe que tem matrícula nova)
  5. Response: { otpSentTo: "***@email.com", redirectTo: "/auth/verify?next=/responsavel/matricula/<id>" }

Frontend redireciona pra tela de verificação OTP.
Responsável digita código → sessão criada → portal /responsavel/matricula/<id>.
A página mostra os 4 eixos (Docs, Assinatura, Pagamento, Turma) com badges
e ações: subir documento faltante, reenviar rejeitado, abrir contrato pra assinar.
```

## Notificações

8 eventos disparam notificação **dual** (e-mail sempre + WhatsApp se `User.whatsappContact = true`):

1. Matrícula iniciada (já existe via OTP mail)
2. Documento rejeitado (com motivo e link pro portal)
3. Contrato pronto pra assinar
4. Lembrete de pendência após N dias parados (job agendado no scheduler)
5. Matrícula completa
6. Documento aprovado (cada um — batching pode entrar como otimização posterior)
7. Todos os documentos aprovados (eixo verde)
8. Pagamento da taxa confirmado

Infra reusada:

- `app/jobs/notifications/email_notification_job.ts`
- `app/jobs/notifications/whatsapp_notification_job.ts` (via `arara_service.ts`)
- `app/mails/` para templates
- `start/scheduler.ts` para o lembrete agendado (evento 4)

## Considered Options

- **Síncrono inline (tudo no POST do form)**. Rejeitado: 3-5 chamadas externas (provider de assinatura, e-mail, notificação) em série causam timeouts e fazem a matrícula inteira falhar quando qualquer serviço periférico está fora. Async com retry isola falhas por eixo.
- **Form público com wizard completo (upload, assinatura embedded, pagamento) sem portal**. Rejeitado: duplica trabalho que o Portal já faz, e a família que volta no dia seguinte fica confusa ("onde eu vejo de novo?"). Concentrar tudo num lugar autenticado.
- **Form mínimo só com e-mail + identificação, resto no portal**. Rejeitado por agora (over-redesign): exigiria refazer o form público que já existe e funciona. Pode evoluir pra isso no futuro se a taxa de abandono do form atual virar problema.
- **Placeholders de Submission criados lazy (só quando responsável envia o primeiro arquivo)**. Rejeitado: a query agregada do eixo Documentação fica mais simples com placeholders desde o início ("approved == total"), e a UI tem o que mostrar imediatamente.
- **Canal único de notificação (WhatsApp se opt-in, e-mail caso contrário)**. Rejeitado: WhatsApp tem alta abertura mas mensagens somem rápido do feed; e-mail é o sistema de registro durável. Dual cobre os dois comportamentos. O custo de duplicação foi aceito.

## Consequences

- `finish_enrollment_controller.ts` precisa ser reescrito: validar janela de matrícula (hoje não valida — é furo), criar placeholders de Submission, dispatch OTP síncrono, enfileirar jobs.
- Nova rota e página: `/responsavel/matricula/:studentHasLevelId` — hospeda os 4 eixos e ações de cada um. Reusa `useSelectedStudent` hook, layout `ResponsavelLayout`.
- Controller novo: `responsavel/upload_student_document_controller.ts` — não existe hoje (ver ADR-0003 para o modelo de Submission/File).
- Notification triggers vão em: `update_document_status_controller.ts` (eventos 2, 6, 7), webhook do provider de assinatura (evento 3), webhook de pagamento (evento 8), service de cálculo de matrícula completa (evento 5), job agendado (evento 4).
- A frase atual "Aguarde a análise dos documentos" na response de sucesso vira mentirosa — substituir por "Enviamos um código de acesso pro seu e-mail" com redirect pra `/auth/verify`.
- Evento 6 (cada doc aprovado individualmente) pode gerar volume; batching agrupando aprovações próximas no tempo é uma otimização posterior, não bloqueante pro MVP.
