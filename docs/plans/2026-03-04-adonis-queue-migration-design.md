# Migracao de Filas para @adonisjs/queue (Design)

## Objetivo

Substituir completamente `@boringnode/queue` por `@adonisjs/queue`, mantendo comportamento funcional atual, com `database` como adapter principal e `sync` disponivel para desenvolvimento local.

## Escopo Aprovado

- Migracao completa (big bang) sem camada de compatibilidade.
- Remocao de `getQueueManager()` e de bootstrap manual de queue.
- Troca de worker custom para comando oficial do Adonis Queue.
- Preservacao de nomes de filas e fluxos de jobs existentes.
- Inclusao de `sync: drivers.sync()` para rodar local.

## Arquitetura Alvo

1. **Pacote oficial**
   - Usar `@adonisjs/queue` para jobs, dispatch, scheduler e worker.
   - Remover dependencia direta de `@boringnode/queue` do codigo de aplicacao.

2. **Configuracao de adapters**
   - `config/queue.ts` com `defineConfig` e `drivers` do pacote Adonis.
   - Adapter `database` como padrao para ambientes reais.
   - Adapter `sync` habilitado para execucao local sem worker separado.
   - Selecao via `QUEUE_DRIVER`.

3. **Execucao de jobs**
   - Jobs continuam em `app/jobs/**/*.ts` com `Job` class e `dispatch` estatico.
   - Worker oficial: `node ace queue:work`.
   - Scheduler continua em `start/scheduler.ts` sem chamada de inicializacao manual.

## Mudancas de Componentes

- `package.json`
  - Trocar dependencia para `@adonisjs/queue` (pinned).
  - Atualizar scripts conforme comandos oficiais.

- `adonisrc.ts`
  - Registrar provider e commands de `@adonisjs/queue`.
  - Remover provider custom de queue.

- `config/queue.ts`
  - Migrar de knex adapter de boringnode para drivers do Adonis Queue.
  - Definir `database` e `sync`.
  - Manter `locations` e parametros de worker.

- `app/jobs/**/*.ts`
  - Atualizar imports `Job` para `@adonisjs/queue`.
  - Ajustar tipos de options quando necessario.

- `start/scheduler.ts`
  - Remover `getQueueManager()` e manter dispatch direto.

- Remocoes
  - `providers/queue_provider.ts`
  - `app/services/queue_service.ts`
  - `commands/queue_work.ts`

- Revisoes pontuais
  - Comandos/utilitarios que consultam `queue_jobs`.
  - Trechos de debug que dependem de bootstrap manual.

## Fluxo de Dados (Pos-Migracao)

1. Controller/service/scheduler dispara `SomeJob.dispatch(payload)`.
2. Job entra no backend definido por `QUEUE_DRIVER`.
3. Em `sync`, job executa no mesmo processo.
4. Em `database`, worker oficial busca da fila e executa.
5. Falhas seguem estrategia de retry/backoff configurada.

## Erros, Retry e Observabilidade

- Retry/backoff centralizado em `config/queue.ts` (global), com overrides apenas em jobs sensiveis.
- Manter hooks de falha (`failed`) nos jobs onde ja existem.
- Preservar monitoracao de tabelas de queue (`queue_jobs` / `queue_schedules`) no modo database.

## Estrategia de Teste e Validacao

1. **Config local**
   - Rodar com `QUEUE_DRIVER=sync` e validar dispatch sem worker.
2. **Config database**
   - Rodar com `QUEUE_DRIVER=database` e `node ace queue:work`.
3. **Smokes criticos**
   - Payments: ao menos um fluxo completo.
   - Asaas webhook: ao menos um processamento com dispatch.
   - Gamification: ao menos um job agendado/disparado.
4. **Scheduler**
   - Validar preload e disparos sem `getQueueManager()`.
5. **Testes automatizados**
   - Ajustar testes de dispatch para fake do `@adonisjs/queue`, onde houver.

## Riscos e Mitigacoes

- **Risco:** API experimental de `@adonisjs/queue`.
  - **Mitigacao:** pin de versao em `package.json`.

- **Risco:** regressao em pontos de dispatch espalhados.
  - **Mitigacao:** grep global por `getQueueManager` e `@boringnode/queue` + smokes direcionados.

- **Risco:** diferencas de comportamento de worker entre implementacao custom e oficial.
  - **Mitigacao:** validar parametros de concorrencia/filas e graceful shutdown na config oficial.

## Criterio de Pronto

- Nenhuma referencia ativa a `@boringnode/queue` no codigo da aplicacao.
- Nenhum uso de `getQueueManager()`.
- Worker oficial do Adonis Queue em uso.
- Fluxos criticos de jobs executando com sucesso em `database`.
- Execucao local funcional via `QUEUE_DRIVER=sync`.
