# Coldreach por E-mail: Escolas Particulares de SP

**Data:** 2026-03-14  
**Status:** Aprovado

## Objetivo

Criar um script para gerar leads de coldreach por e-mail de escolas particulares no estado de Sao Paulo (incluindo Baixada Santista), com foco em contatos institucionais publicos.

Saida desejada em CSV com colunas:

- `nome`
- `cidade`
- `email`
- `telefone`
- `site`
- `fonte`
- `confidence_score` (opcional, mas recomendado)

## Escopo Aprovado

- Tipo de escola: particulares
- Regiao: estado inteiro de SP (Baixada inclusa)
- E-mails: somente institucionais
- Meta de volume: sem meta fixa (rodar ate esgotar consultas/fontes)

## Abordagens Consideradas

### 1) Busca web + crawling leve por dominio (recomendada)

Gerar consultas por cidade, coletar resultados de busca, identificar site oficial da escola, visitar paginas-chave e extrair contatos.

**Pros**

- Melhor equilibrio entre cobertura, custo e simplicidade
- Nao depende de API paga
- Escala bem com cache/resume

**Contras**

- Pode sofrer bloqueios de SERP
- Ruido em alguns resultados

### 2) Diretorios estruturados primeiro + busca web como fallback

**Pros**

- Maior precisao inicial

**Contras**

- Cobertura irregular e possivel desatualizacao

### 3) Google Maps Places + site da escola

**Pros**

- Alta cobertura de estabelecimentos

**Contras**

- Dependencia de API key/custo e quotas

## Arquitetura da Solucao

Pipeline em 6 etapas:

1. Seed de cidades de SP
2. Busca web por consultas parametrizadas (Google e DuckDuckGo)
3. Descoberta e normalizacao de site oficial
4. Crawling leve de paginas de contato
5. Extracao e filtragem de e-mails institucionais
6. Deduplicacao, scoring e exportacao CSV

## Pipeline de Coleta

### Consultas por cidade

Montar queries com variacoes como:

- `escola particular <cidade> SP`
- `colegio particular <cidade> SP`
- `educacao infantil particular <cidade> SP`

Usar paginacao controlada por query, com delay + jitter entre requisicoes.

### Descoberta de dominios

Para cada resultado:

- extrair dominio
- remover agregadores/listagens sempre que possivel
- priorizar site que aparenta ser oficial da escola

### Crawling leve

Visitar:

- home
- `/contato`
- `/fale-conosco`
- `/institucional`

Extrair:

- e-mails (texto + `mailto:`)
- telefone
- nome da instituicao

## Regras de Qualidade e Compliance

### E-mail institucional apenas

- rejeitar provedores pessoais (`gmail.com`, `hotmail.com`, `outlook.com`, `yahoo.com`, etc.)
- aceitar local-part com sinais institucionais: `contato`, `secretaria`, `atendimento`, `comercial`, `diretoria`, `adm`, `coordenacao`, `pedagogico`

### Validacoes

- descartar placeholders (`example.com`, etc.)
- descartar e-mails de terceiros sem vinculo claro com a escola
- excluir sinais explicitos de escola publica quando presentes (`E.E.`, `EMEF`, `estadual`, `municipal`)

### Deduplicacao

- chave primaria: `email`
- secundaria: `site + email`
- manter registro mais completo (`nome` + `cidade` preenchidos)

## Scoring de Confianca

Heuristica recomendada:

- +40: e-mail no mesmo dominio do site da escola
- +25: e-mail extraido de pagina de contato
- +20: local-part institucional
- -30: dominio parece agregador/listagem

## Interface de Execucao (CLI)

Comando base:

```bash
node scripts/coldreach-schools-sp.mjs --engine=google,duckduckgo --output=data/leads/escolas-sp.csv
```

Parametros recomendados:

- `--cities-file=data/reference/sp-cities.csv`
- `--max-results-per-query=20`
- `--delay-ms=1200`
- `--jitter-ms=500`
- `--resume-from-cache`
- `--only-region=baixada-santista` (modo opcional segmentado)

## Artefatos Gerados

- `data/leads/escolas-sp.csv` (final)
- `data/leads/escolas-sp.raw.jsonl` (auditoria)
- `data/cache/` (cache de busca/paginas)
- `data/leads/escolas-sp.report.json` (metricas finais)

## Tratamento de Erros e Robustez

Tipos previstos:

- `search_blocked`
- `request_timeout`
- `parse_error`
- `dns_error`

Estrategia:

- retry com backoff para 429/5xx/timeout
- timeout por requisicao
- checkpoint por cidade
- falha isolada nao interrompe pipeline

## Validacao Final

Antes de exportar:

- remover linhas sem `email` ou `site`
- validar formato de e-mail e telefone
- aplicar deduplicacao final
- consolidar metricas de qualidade no report

## Criterios de Sucesso

- Pipeline executa de ponta a ponta sem crash
- CSV final contem contatos institucionais de escolas particulares de SP
- Reexecucao com `resume/cache` funciona sem duplicar resultado

## Implementacao

- Plano de execucao: `docs/plans/2026-03-14-coldreach-escolas-sp-implementation-plan.md`
- Runbook operacional: `docs/coldreach-escolas-sp.md`
