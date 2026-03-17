# Silva Gomes - Faturas Fev/Mar 2026

## Resumo

| Status | Qtd | Fev | Mar |
|--------|-----|-----|-----|
| **PAID** | 29 | 18 | 11 |
| **OVERDUE** | 43 | 3 | 40 |
| **PENDING** | 2 | 2 | 0 |
| **CANCELLED** | 2 | 1 | 1 |
| **Total** | 76 | 24 | 52 |

---

## FEVEREIRO - Abertas (não marcadas como pago)

| Aluno | Vencimento | Valor | Status |
|-------|------------|-------|--------|
| **MARIA JULIA ALVES DE OLIVEIRA** | 05/02 | R$ 600 | PENDING |
| **MARIA JULIA ALVES DE OLIVEIRA** | 10/02 | R$ 720 | OVERDUE |
| **RAFAEL SILVA REIS JUNIOR** | 05/02 | R$ 1.300 | PENDING |
| **RAFAEL SILVA REIS JUNIOR** | 10/02 | R$ 1.300 | OVERDUE |
| **IVAN LUIZ** | 10/02 | R$ 720 | OVERDUE |

**Total fev abertas: 5 faturas** (3 alunos)

---

## FEVEREIRO - Marcadas como pago (PAID)

| Aluno | Vencimento | Valor | Marcado pago em | Última atualização |
|-------|------------|-------|-----------------|---------------------|
| ALICE CASTRO NOBRE LOPES DOS SANTOS | 05/02 | R$ 600 | 10/03 | 10/03 18:01 |
| ALICE CASTRO NOBRE LOPES DOS SANTOS | 10/02 | R$ 1.300 | 10/03 | 10/03 18:01 |
| ANNA GIULIA CETTOLIN FRANCISCHELLI | 05/02 | R$ 1.300 | 10/03 | 10/03 16:24 |
| ANNA GIULIA CETTOLIN FRANCISCHELLI | 10/02 | R$ 1.300 | 10/03 | 10/03 16:24 |
| BRAYAN SOUZA MENDES | 05/02 | R$ 600 | 03/03 | 04/03 17:25 |
| BRAYAN SOUZA MENDES | 10/02 | R$ 720 | 03/03 | 04/03 17:25 |
| DAVI RICHARD FERREIRA EUGÊNIO | 05/02 | R$ 600 | 10/03 | 10/03 21:10 |
| DAVI RICHARD FERREIRA EUGÊNIO | 10/02 | R$ 720 | 10/03 | 10/03 21:10 |
| FELIPE ALVES RIBEIRO | 05/02 | R$ 600 | 04/03 | 04/03 17:22 |
| FELIPE ALVES RIBEIRO | 10/02 | R$ 720 | 04/03 | 04/03 17:23 |
| LAURA CAMPOS MAYER | 05/02 | R$ 600 | 10/03 | 10/03 18:04 |
| LAURA CAMPOS MAYER | 10/02 | R$ 1.300 | 10/03 | 10/03 18:04 |
| MARIA CLARA ARAUJO SANTANA | 05/02 | R$ 600 | 10/03 | 10/03 21:09 |
| MARIA CLARA ARAUJO SANTANA | 10/02 | R$ 1.300 | 10/03 | 10/03 21:09 |
| MARIA LUIZA ALVES DE OLIVEIRA | 05/02 | R$ 1.300 | 10/03 | 10/03 21:10 |
| MARIA LUIZA ALVES DE OLIVEIRA | 10/02 | R$ 720 | 10/03 | 10/03 21:10 |
| MIGUEL GOMES MARINHO | 05/02 | R$ 600 | 10/03 | 10/03 21:06 |
| MIGUEL GOMES MARINHO | 10/02 | R$ 720 | 10/03 | 10/03 21:06 |
| MIRELLA DA SILVA BEZERRA | 05/02 | R$ 600 | 10/03 | 10/03 21:10 |
| MIRELLA DA SILVA BEZERRA | 10/02 | R$ 600 | 10/03 | 10/03 21:10 |
| RODRIGO CORREA PECHINI | 05/02 | R$ 600 | 10/03 | 10/03 21:02 |
| RODRIGO CORREA PECHINI | 10/02 | R$ 1.300 | 10/03 | 10/03 21:02 |
| LORENA RODRIGUES DOS SANTOS | 10/02 | R$ 720 | 10/03 | 10/03 21:09 |

**Total fev pagas: 23 faturas** (11 alunos)

---

## Conclusão sobre fev abertas

As **5 faturas de fevereiro ainda abertas** são de 3 alunos:
- **MARIA JULIA ALVES DE OLIVEIRA** (2 faturas)
- **RAFAEL SILVA REIS JUNIOR** (2 faturas)  
- **IVAN LUIZ** (1 fatura)

**Nenhuma** dessas faturas tem `paidAt` ou `updatedAt` em data de sexta (13 ou 14/03). Ou seja, **não há registro no banco de que tenham sido marcadas como pagas** em nenhum momento.

Se a escola diz que marcou alguma delas:
1. **Erro nosso (recriou):** Improvável – o PITR (15h e 18h de sexta) mostra o mesmo estado que o prod. Se tivessem sido marcadas antes do acidente e perdidas na restauração, o PITR teria mais PAID que o prod.
2. **Escola não marcou:** Mais provável – não há evidência no banco de que essas 5 faturas tenham sido marcadas como pagas em nenhum momento.
