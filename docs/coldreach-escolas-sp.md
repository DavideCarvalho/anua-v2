# Coldreach Escolas SP

Script para coletar contatos institucionais de escolas particulares no estado de Sao Paulo e exportar em CSV.

## Objetivo

- Buscar sites de escolas por cidade (Google e DuckDuckGo)
- Extrair e-mails/telefones das paginas publicas
- Filtrar e-mails pessoais
- Exportar leads deduplicados para coldreach

## Comando Basico

```bash
node scripts/coldreach-schools-sp.mjs --engine=google,duckduckgo --output=data/leads/escolas-sp.csv
```

## Opcoes

- `--engine=google,duckduckgo` motores de busca (um ou mais, separados por virgula)
- `--output=data/leads/escolas-sp.csv` arquivo final CSV
- `--cities-file=data/reference/sp-cities.csv` lista de cidades de entrada
- `--max-results-per-query=20` limite de resultados por consulta
- `--delay-ms=1200` atraso base entre buscas
- `--jitter-ms=500` jitter aleatorio para reduzir padrao de requests
- `--resume-from-cache` retoma cidades processadas via checkpoint
- `--only-region=baixada-santista` restringe para Baixada

## Arquivos Gerados

- `data/leads/escolas-sp.csv` saida final
- `data/leads/escolas-sp.raw.jsonl` dados deduplicados em JSONL
- `data/leads/escolas-sp.report.json` metricas da execucao
- `data/cache/*.json` cache de buscas por query
- `data/cache/coldreach-checkpoint.json` cidades ja processadas

## Smoke Run

```bash
node scripts/coldreach-schools-sp.mjs --only-region=baixada-santista --max-results-per-query=3 --output=data/leads/escolas-sp-smoke.csv
```

## Regras de Compliance

- O script mantem apenas e-mails institucionais
- Provedores pessoais sao descartados (`gmail.com`, `hotmail.com`, `outlook.com`, etc.)
- A coleta usa somente informacoes publicas em paginas abertas

## Limitacoes Conhecidas

- Bloqueios de SERP/captcha podem reduzir resultados
- Alguns sites nao publicam e-mail e ficam sem lead
- A lista padrao de cidades e enxuta; para cobertura ampla, use arquivo completo via `--cities-file`
