-- Script para comparar dados da Escola Silva Gomes entre banco atual (prod) e clone PITR (sexta 14/03)
-- Execute em cada banco e compare os resultados
--
-- PROD (atual):  psql "postgresql://app_user:PASSWORD@34.39.158.54:5432/school_super_app" -f scripts/compare_pitr_silva_gomes.sql
-- PITR (clone):  psql "postgresql://app_user:PASSWORD@35.199.111.141:5432/school_super_app" -f scripts/compare_pitr_silva_gomes.sql
--
-- O clone PITR pode precisar ter seu IP autorizado no Cloud SQL:
--   gcloud sql instances patch pitr-silva-gomes-check-20260314 --authorized-networks=SEU_IP/32 --project=anua-480822

\echo '=== Escola Silva Gomes ==='
SELECT id, name, slug FROM "School" WHERE name ILIKE '%silva%gomes%' OR name ILIKE '%silva gomes%';

\echo ''
\echo '=== ContractPaymentDay da Silva Gomes (datas de pagamento dos contratos) ==='
SELECT 
  cpd.id as payment_day_id,
  cpd."contractId",
  cpd.day,
  c.name as contract_name,
  c."schoolId"
FROM "ContractPaymentDay" cpd
JOIN "Contract" c ON c.id = cpd."contractId"
JOIN "School" s ON s.id = c."schoolId"
WHERE s.name ILIKE '%silva%gomes%' OR s.name ILIKE '%silva gomes%'
ORDER BY cpd."contractId", cpd.day;

\echo ''
\echo '=== StudentPayment (parcelas) da Silva Gomes - últimas alterações ==='
SELECT 
  sp.id,
  sp."studentId",
  sp."contractId",
  sp."dueDate",
  sp.status,
  sp."totalAmount",
  sp."updatedAt"
FROM "StudentPayment" sp
JOIN "Contract" c ON c.id = sp."contractId"
JOIN "School" s ON s.id = c."schoolId"
WHERE (s.name ILIKE '%silva%gomes%' OR s.name ILIKE '%silva gomes%')
ORDER BY sp."updatedAt" DESC
LIMIT 50;

\echo ''
\echo '=== Contratos da Silva Gomes com contagem de payment days ==='
SELECT 
  c.id,
  c.name,
  (SELECT COUNT(*) FROM "ContractPaymentDay" cpd WHERE cpd."contractId" = c.id) as payment_days_count,
  c."updatedAt"
FROM "Contract" c
JOIN "School" s ON s.id = c."schoolId"
WHERE s.name ILIKE '%silva%gomes%' OR s.name ILIKE '%silva gomes%'
ORDER BY c."updatedAt" DESC;
