# Verificação PITR - Escola Silva Gomes

## Contexto

Na sexta-feira 14/03 foi necessário restaurar o backup do banco após apagar dados acidentalmente. A Escola Silva Gomes reporta que alterações feitas na sexta (ex: mudar datas de pagamento dos pais) não estão no sistema atual.

## O que foi feito

1. **PITR está habilitado** no Cloud SQL de produção:
   - `pointInTimeRecoveryEnabled: true`
   - `transactionLogRetentionDays: 7`
   - Janela de recuperação: 12/03 21:51 UTC até 16/03 21:39 UTC

2. **Clone PITR criado** para sexta 14/03 às 18:00 UTC (15:00 BRT):
   - Nome: `pitr-silva-gomes-check-20260314`
   - IP: 35.199.111.141
   - Status: em criação (PENDING_CREATE → RUNNABLE)

3. **Script de comparação** criado em `scripts/compare_pitr_silva_gomes.sql`

## Como verificar quando o clone estiver pronto

### 1. Verificar se o clone está RUNNABLE

```bash
gcloud sql instances describe pitr-silva-gomes-check-20260314 --project=anua-480822 --format="value(state)"
```

### 2. Executar o script no clone PITR

```bash
# Use a senha do Secret Manager: production-anua-v2-db-password
PGPASSWORD='SUA_SENHA' psql "postgresql://app_user@35.199.111.141:5432/school_super_app" \
  -f scripts/compare_pitr_silva_gomes.sql > /tmp/pitr_silva_gomes.txt
```

### 3. Comparar com o resultado do prod (já executado)

O baseline do prod foi salvo. Compare:
- **ContractPaymentDay**: datas de pagamento (10, 15, 20, 25) por contrato
- **StudentPayment**: parcelas com dueDate e updatedAt
- **Contratos**: contagem de payment days por contrato

Se o clone PITR tiver MAIS registros ou DATAS DIFERENTES que o prod atual, isso indica o que foi perdido na restauração.

### 4. Deletar o clone após a análise (para evitar custos)

```bash
gcloud sql instances delete pitr-silva-gomes-check-20260314 --project=anua-480822
```

## Dados atuais da Silva Gomes (prod)

- **School ID**: bc608ac0-28b5-44e5-8239-c37569a7a01a
- **ContractPaymentDay**: 22 registros (dias 10, 15, 20, 25 em vários contratos)
- **Contratos**: 7 contratos com 1-4 payment days cada

## Se precisar de outro timestamp

O acidente pode ter ocorrido em outro horário. Para criar um clone com outro ponto no tempo:

```bash
# Ex: sexta 14/03 às 14:00 BRT = 17:00 UTC
gcloud sql instances clone prod-school-super-app-postgres-95d21e81 pitr-outro-timestamp \
  --project=anua-480822 \
  --point-in-time='2026-03-14T17:00:00.000Z'
```

Janela disponível: 2026-03-12T21:51:50Z até 2026-03-16T21:39:33Z
