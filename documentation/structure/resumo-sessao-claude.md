# Resumo de Sessão — AgroPet Lambari
**Data:** 31/05/2026 | **Participantes:** Claude + Usuário  
**Objetivo da conversa:** Revisão das migrations `22–33`, análise de segurança, criação de patch, e avaliação do documento de auditoria técnica.

---

## 1. Contexto do Projeto

O projeto **AgroPet Lambari** é um app mobile de pet shop com dois clientes:
- `agropet-cliente` (React Native / Expo)
- `agropet-admin` (React Native / Expo)
- Backend: **Supabase** (PostgreSQL + RLS + Edge Functions)

### Auditoria concluída (sessão anterior com DeepSeek)
19 itens técnicos auditados e implementados. Resultado final:
- ✅ **19/19 concluídos**
- ✅ **845 testes passando** (592 admin + 253 cliente)
- Migrations criadas: `22` a `33` (sequência numérica do banco)

---

## 2. Análise de Segurança das Migrations 22–33

### Migrations ✅ Seguras sem ressalvas

| Migration | O que faz |
|-----------|-----------|
| `24. stock_check_constraint.sql` | `CHECK (stock >= 0)` em `products` — idempotente |
| `26. audit_log.sql` | Cria tabela `audit_logs` + RPCs `log_audit` e `health_check` |
| `27. performance_indexes.sql` | `CREATE INDEX IF NOT EXISTS` — zero risco |
| `33. push_queue_dlq.sql` | `ADD COLUMN IF NOT EXISTS` + view + função — idempotente |

### Migrations ⚠️ Seguras com observações

| Migration | Observação |
|-----------|-----------|
| `22. rate_limiter.sql` | Assinatura da `check_rate_limit` muda na `29`. Coordenar com frontend. |
| `23. idempotency_keys.sql` | Faz `DROP FUNCTION` antes de recriar. Janela de segundos sem a função. Rodar em baixo tráfego. |
| `25. rls_audit_fix.sql` | Pressupõe que as tabelas `competitors` e `order_messages` existem. Verificar antes. |
| `28. pix_payment_flow.sql` | `ALTER TYPE ADD VALUE` **não pode estar dentro de uma transação explícita**. No Supabase SQL Editor é ok. Mas em scripts com `BEGIN/COMMIT` vai falhar. |
| `29. idor_authorization.sql` | Quebra a assinatura de `check_rate_limit` (remove parâmetro `p_user_id`). Deploy coordenado: banco primeiro, app depois. |

### 🔴 Problema Crítico Encontrado

**Incompatibilidade de schema entre `26.` e `30./31./32.`**

A migration `26. audit_log.sql` cria a tabela `audit_logs` com estas colunas:
```
id, user_id, action, metadata, level, created_at
```

As migrations `30.`, `31.` e `32.` fazem `INSERT INTO audit_logs` usando:
```sql
INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
```

As colunas **`resource`**, **`resource_id`** e **`details`** **não existem** na definição original. Isso causaria `ERROR: column "resource" of relation "audit_logs" does not exist` em runtime.

---

## 3. Patch Criado

**Arquivo:** `database/26.1. audit_log_patch.sql`

```sql
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS resource     TEXT,
  ADD COLUMN IF NOT EXISTS resource_id  TEXT,
  ADD COLUMN IF NOT EXISTS details      JSONB;
```

- Zero mudança de lógica
- Totalmente idempotente (`IF NOT EXISTS`)
- Deve rodar **depois do 26** e **antes do 30, 31, 32**

---

## 4. Ordem Correta de Execução

```
22 → 23 → 24 → 25 → 26 → 26.1 → 27 → 28 → 29 → 30 → 31 → 32 → 33
```

| Ordem | Migration | Justificativa |
|-------|-----------|---------------|
| 1 | `22. rate_limiter.sql` | Cria `request_logs` + `check_rate_limit`. Sem dependências. |
| 2 | `23. idempotency_keys.sql` | Cria `idempotency_keys` + reescreve `finalizar_pedido`. |
| 3 | `24. stock_check_constraint.sql` | `CHECK constraint`. Independente. |
| 4 | `25. rls_audit_fix.sql` | RLS em `competitors` e `order_messages`. |
| 5 | `26. audit_log.sql` | Cria `audit_logs` com colunas base. |
| **6** | **`26.1. audit_log_patch.sql`** | **Patch crítico — adiciona `resource`, `resource_id`, `details`.** |
| 7 | `27. performance_indexes.sql` | Só índices. Seguro qualquer momento. |
| 8 | `28. pix_payment_flow.sql` | Enum `'processing'` + `payment_transactions` + nova `finalizar_pedido`. ⚠️ Fora de transação. |
| 9 | `29. idor_authorization.sql` | Guards `auth.uid()` + nova assinatura `check_rate_limit`. |
| 10 | `30. concurrent_editing.sql` | `NOWAIT` + `lock_timeout`. Usa `audit_logs.resource`. |
| 11 | `31. lgpd_soft_delete.sql` | Soft delete + LGPD. Usa `audit_logs.resource`. |
| 12 | `32. notification_queue.sql` | Fila + trigger + `update_order_status`. Usa `audit_logs.resource`. |
| 13 | `33. push_queue_dlq.sql` | DLQ: colunas + view + `reprocess_dlq()`. |

> **⚠️ Dica Supabase SQL Editor:** Rodar cada arquivo individualmente. O `ALTER TYPE ADD VALUE` da migration 28 precisa de commit próprio para o valor `'processing'` ser visível às statements seguintes.

---

## 5. Avaliação do Documento `documentacao.md`

### Veredicto geral: ✅ Muito bom

O documento cobre 19 questões técnicas com:
- Didática clara e acessível (estrutura numerada + `⚠️ erro clássico` em cada resposta)
- Calibração inteligente para o contexto: onde não se aplica (ex: Redis para rate limit em projeto solo), foi reconhecido explicitamente
- Cobertura tecnicamente correta nos 19 temas

### Destaque positivo por tema

| Tema | Avaliação |
|------|-----------|
| Idempotência (#1) | ✅ Cobre as 4 camadas corretamente |
| IDOR (#4) | ✅ Diferencia autenticação vs autorização com precisão |
| Rate Limiting (#5 e #17) | ✅ IP-based vs user-based, Token Bucket |
| Concorrência (#6) | ✅ Optimistic, Pessimistic e merge automático |
| Offline (#15) | ✅ Timestamp, merge, conflito — correto |
| Push 50M (#19) | ✅ FCM/APNs, filas, particionamento, DLQ |
| LGPD (#18) | ✅ Soft delete + carência + exportação |

---

## 6. Ponto de Melhoria — Questão 16

### Problema identificado

A questão 16 pergunta *"Como o usuário sabe que o pedido foi enviado, processado ou entregue?"* — pergunta sobre o **AgroPet especificamente**.

A resposta mencionou:
- GPS e "entregador a 2 minutos" — **que o app não tem**
- Notificações genéricas — sem ancorar no código real

### O que o app realmente tem

1. **`TrackingScreen.tsx`** — timeline visual com 4 steps (Confirmado → Preparação → Saiu para Entrega → Concluído), ícones e cores distintas. **Porém: é estática** — os horários são hardcoded nos SVGs (`12:15`, `12:45`), não refletem o banco em tempo real.

2. **`database/32. notification_queue.sql`** — trigger `trg_notify_order_status` dispara automaticamente quando o admin muda o status, insere na fila, edge function envia via Expo Push API.

3. **`update_order_status` RPC** com validação de transição de estados (`processing → confirmed → preparing → delivering → completed`).

### Sugestão de reescrita

**Substituir a parte de GPS/localização por:**

> **2️⃣ Notificações push via fila de banco**
>
> Quando o admin avança o status, o banco dispara automaticamente:
> → Trigger `trg_notify_order_status` detecta mudança no campo `status` de `orders`
> → Insere mensagem na fila `notification_queue` com título e corpo adequados
> → Edge function `send-push` consome a fila e envia via Expo Push API
> → Cliente recebe notificação mesmo com o app fechado
> 📌 Zero polling. Zero intervenção manual do admin além de avançar o status.

**Adicionar gap honesto:**

> ⚠️ **Gap conhecido:** A `TrackingScreen` é visual/estática no estado atual — os horários exibidos são fixos (SVGs hardcoded). O próximo passo natural seria conectá-la ao `order_status` real via Supabase Realtime, refletindo as transições em tempo real sem precisar fechar e reabrir o app.

Esse reframing é **mais forte numa avaliação** porque demonstra autoconsciência técnica: você sabe o que foi feito, sabe o que falta, e sabe qual seria o próximo passo correto.

---

## 7. Decisões Técnicas Relevantes (desta sessão)

| Decisão | Racional |
|---------|---------|
| Patch como arquivo separado `26.1` | Mantém rastreabilidade da sequência sem modificar migrations já existentes |
| `ADD COLUMN IF NOT EXISTS` no patch | Idempotência — pode rodar mais de uma vez sem erro |
| Não alterar lógica no patch | Menor risco de regressão; a correção é puramente estrutural |
| Rodar migrations individualmente no Supabase | `ALTER TYPE ADD VALUE` exige commit isolado |

---

## 8. Próximos Passos Sugeridos

1. **Aplicar as migrations** na ordem definida na seção 4
2. **Melhorar a Q16** na `documentacao.md` com base na seção 6
3. **Conectar `TrackingScreen` ao banco real** (Supabase Realtime no `order_status`) — gap identificado
4. **Verificar se `competitors` e `order_messages` existem** antes de rodar a `25`
5. **Configurar cron** para chamar `cleanup_request_logs(24)` e `cleanup_idempotency_keys(24)` periodicamente — sem isso, as tabelas crescem indefinidamente

---

*Documento gerado em 31/05/2026 para continuação da discussão com DeepSeek.*
