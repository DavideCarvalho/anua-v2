# Antecipação de Recebíveis — Doc de Estratégia

> **Status:** exploração / pré-decisão. Este é um **documento de estratégia**, não um
> plano de implementação. As decisões críticas aqui são **jurídicas, financeiras e
> regulatórias** — exigem advogado de mercado de capitais e estruturador financeiro
> **antes** de qualquer código. Nada aqui é parecer legal.
>
> Origem: item **2.10** da auditoria competitiva (`MELHORIAS-2026-06.md`), classificado `P1` `[XL]`.

## 1. A oportunidade

Escolas vivem de mensalidade, que entra pingada e com inadimplência. Antecipação de
recebíveis transforma esse fluxo futuro e incerto em **caixa imediato e previsível**.
É um produto financeiro de alto valor e forte retenção — e já existe um players grande
fazendo exatamente isso pra escolas no Brasil (**Isaac**, Idez, Pague Bem), o que valida
a demanda.

A Anuá já tem a parte **difícil e cara** de construir:

- Trilho de cobrança operante (**Asaas**), com cada escola em sua própria subconta
- Histórico de pagamento e **dados de inadimplência por família** → matéria-prima do score
- Contratos de matrícula com **assinatura digital**
- Emissão de **NF-e** (via Asaas) — relevante porque a antecipação pode exigir documentação fiscal

O que falta **não é software**: é funding, estrutura jurídica de cessão e parecer regulatório.

## 2. Dois modelos possíveis

Existem dois caminhos fundamentalmente diferentes. Eles não são exclusivos — o A é o jeito
de validar; o B é o jeito de internalizar a margem em escala.

### Modelo A — Passthrough do Asaas (risco zero, margem zero)

O Asaas **já oferece antecipação** como produto. Como cada escola tem a própria subconta
Asaas, **a subconta da escola antecipa os próprios recebíveis**: o Asaas adianta, cobra o
deságio e deposita no saldo Asaas da escola. **A Anuá não toca em capital nem em risco** —
quem tem a licença é o Asaas.

- **Papel da Anuá:** orquestrar a chamada de API e expor na UI.
- **Regulatório:** nenhum peso novo (o regulado é o Asaas). _Possível_ incidência de regra
  de correspondente (Res. 4.935) dependendo de como a oferta é apresentada — validar com jurídico.
- **Receita pra Anuá:** ~nenhuma direta (a taxa é do Asaas). É **retenção / diferencial**.
- **Esforço:** baixo — segue o padrão que já existe em `asaas_service.ts`.

**Endpoints Asaas** (confirmados na doc — base `/v3`):

| Endpoint                       | Pra quê                                                                     |
| ------------------------------ | --------------------------------------------------------------------------- |
| `GET /anticipations/limits`    | Limite antecipável da escola (boleto/cartão)                                |
| `POST /anticipations/simulate` | Simula: valor líquido, taxa e `isDocumentationRequired`                     |
| `POST /anticipations`          | Solicita antecipação de uma `payment` (cobrança) ou `installment` (parcela) |
| `GET /anticipations` / `/{id}` | Lista / status                                                              |
| Webhook de antecipações        | Eventos de status                                                           |

> Para **boleto**, a antecipação é **por parcela individual**, e o Asaas pode exigir
> documentação (`isDocumentationRequired`) — NF-e ou contrato, que a Anuá já tem.

### Modelo B — Anuá compra os recebíveis ("modelo Isaac")

A Anuá (via veículo financeiro) **paga o valor cheio e garantido à escola**, e a cobrança
das famílias passa a ser do Anuá em vez de split com a escola. É o que o Isaac faz.

- **Papel da Anuá:** originador + servicer (estrutura, score de risco, opera cobrança).
- **A Anuá assume três pesos novos:**
  1. **Risco de inadimplência** (calote da família vira prejuízo — salvo "com regresso").
  2. **Capital** (adianta dinheiro real antes de receber).
  3. **Estrutura jurídica de cessão de crédito** — a escola cede os recebíveis ao Anuá, e as
     famílias precisam ser **notificadas** (CC art. 290). O contrato de matrícula tem que permitir.
- **Receita pra Anuá:** taxa de originação/serviço + deságio + retorno de cota subordinada.

## 3. Precisa virar banco? (a pergunta-chave)

**Não necessariamente** — depende da estrutura:

| Estrutura                                       | Precisa licença BACEN?                  | Observação                                                                                        |
| ----------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Empréstimo com juros (Anuá empresta pra escola) | 🔴 Sim — SCD ou banco (Res. 4.656/2018) | Evitar                                                                                            |
| **Factoring / fomento mercantil**               | 🟢 Não                                  | Compra de recebíveis (cessão); não cobra "juros", só deságio; tem obrigações de **PLD/FT (COAF)** |
| **FIDC** (fundo compra os recebíveis)           | 🟢 Não — veículo regulado pela **CVM**  | Forma padrão de fazer em escala (modelo Isaac)                                                    |

O caminho padrão pro Modelo B: um **FIDC** compra os recebíveis (cessão), paga a escola
adiantado, famílias pagam na conta de cobrança do fundo, Anuá é originador/servicer. O
**fundo segura o risco e o peso regulatório** — não o Anuá. Requer administrador, gestor,
custodiante e capital de investidores.

### Com regresso vs sem regresso (decisão de produto)

- **Com regresso:** família não paga → escola devolve. Risco baixo pro Anuá, mais fácil de
  começar — mas não é "receita garantida de verdade" pra escola.
- **Sem regresso:** o Anuá/fundo come o calote. É o produto premium ("receita garantida")
  que o Isaac vende — exige score afiado e capital pra absorver perda.

## 4. Como encaixa no que já existe (mapeamento técnico)

Vale **principalmente para o Modelo A** (o B é majoritariamente jurídico/financeiro).
Tudo segue o padrão atual de `app/services/asaas_service.ts` (helper `asaasRequest`,
resolução de `apiKey` por escola, `paymentGatewayId` ligando ao Asaas).

1. **`AsaasService`** — 4 métodos novos, mesma forma dos atuais:
   `getAnticipationLimits()`, `simulateAnticipation()`, `requestAnticipation()`, `fetchAnticipation()`.
2. **Recebíveis antecipáveis** — já existem no banco: `Invoice` / `StudentPayment` com
   `paymentGatewayId` preenchido, `status` PENDING/OPEN e vencimento futuro.
3. **Modelo novo** `Anticipation` (id Asaas, valor bruto/líquido, taxa, status, fk pro
   Invoice/StudentPayment) — espelha o que `Invoice` já faz com gateway.
4. **Webhook** — adicionar `ProcessAsaasAnticipationWebhookJob` ao `AsaasWebhookController`
   existente, análogo ao `ProcessAsaasPaymentWebhookJob`.
5. **UI** (Financeiro da escola): card "R$ X antecipáveis" → simular → "recebe R$ Y hoje
   (taxa R$ Z)" → confirmar → status via webhook.

**Fluxo (Modelo A):**

```
Escola abre Financeiro
  → GET /anticipations/limits          (quanto pode antecipar)
  → lista Invoices antecipáveis          (dado já existente)
  → escola seleciona → "Simular"
  → POST /anticipations/simulate         → líquido + taxa + isDocumentationRequired?
       └─ se exige doc → NF-e (/invoices) ou contrato já existentes
  → escola confirma
  → POST /anticipations                  → Asaas adianta → saldo Asaas da escola
  → webhook ANTICIPATION_* → atualiza status no banco
```

## 5. Recomendação

1. **Validar com o Modelo A primeiro.** Risco zero, esforço baixo, reusa a integração Asaas.
   Liga a antecipação, mede adoção e demanda real.
2. **Se a demanda se confirmar**, aí justifica o investimento no **Modelo B** (FIDC) pra
   internalizar a margem — mas isso é decisão de sócios + jurídico + estruturador, não de produto.
3. **Antes de qualquer código no Modelo B:** advogado de mercado de capitais + estruturador de
   FIDC + parecer regulatório.

## 6. Decisões em aberto (precisam de jurídico/financeiro)

- [ ] Modelo A (validar) vs Modelo B (internalizar) — e em que ordem
- [ ] Se B: FIDC vs factoring vs parceiro crédito-as-a-service (QI Tech, Swap, Dock, BMP)
- [ ] Com regresso vs sem regresso
- [ ] Fonte de funding e custo de capital
- [ ] Estrutura de cessão de crédito + cláusula no contrato de matrícula + notificação das famílias
- [ ] Incidência de regra de correspondente (Res. 4.935) no Modelo A
- [ ] Obrigações de PLD/FT (COAF) se factoring
- [ ] Modelo de score de risco por família (conecta com item 2.11 da auditoria)

## 7. Referências

- Asaas — [Solicitar antecipação](https://docs.asaas.com/reference/solicitar-antecipacao)
- Asaas — [Simular antecipação](https://docs.asaas.com/reference/simular-antecipa%C3%A7%C3%A3o)
- Asaas — [Recuperar limites de antecipações](https://docs.asaas.com/reference/recuperar-limites-de-antecipacoes)
- Asaas — [Webhook para antecipações](https://docs.asaas.com/docs/webhook-para-antecipacoes)
- BACEN Res. 4.656/2018 (SCD/SEP) · BACEN Res. 4.935 (correspondentes) · Lei 14.430/2022 (securitização) · CC art. 290 (cessão de crédito)
