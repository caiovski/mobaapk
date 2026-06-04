# Relatório de Auditoria Técnica — AgroPet Lambari

> **Data:** 29/05/2026
> **Escopo:** 19 itens de revisão técnica (vide `openspec/changes/documentacao.md`)
> **Código-fonte analisado:** `agropet-cliente/`, `agropet-admin/`, `database/`

---

## Resumo Executivo

| Status | Quantidade | Percentual |
|--------|-----------|-----------|
| ✅ Implementado | 1 | 5% |
| ⚠️ Parcial | 5 | 26% |
| ❌ Não implementado | 13 | 69% |

**Área mais madura:** Controle de estoque e pedidos (locking atômico, trigger de restauro, timeline visual).

**Área mais crítica:** Infraestrutura, observabilidade, segurança além de RLS, e comunicação com usuário.

---

## 1. Cliques duplicados no pagamento (Idempotência)

**Status:** ❌ Não implementado
**Severidade:** Alta

**Evidência:**
- `agropet-cliente/src/presentation/screens/client/PaymentScreen.tsx:114-121` — Chamada ao RPC `finalizar_pedido` sem qualquer `idempotency_key`:
```ts
const { data, error } = await supabase.rpc('finalizar_pedido', {
  p_user_id: user?.id,
  p_items: items,
  p_payment_method: dbPaymentMethod,
  // ... sem idempotency_key
});
```
- `database/7. rpc_finalizar_pedido.sql:12-19` — RPC não aceita parâmetro de idempotência:
```sql
CREATE OR REPLACE FUNCTION public.finalizar_pedido(
  p_user_id UUID,
  p_items JSONB,
  p_payment_method payment_method,
  ...
)
```
- `PaymentScreen.tsx:112` — Única proteção é `setLoading(true)`, que desabilita o botão. Não há prevenção contra retry de rede no cliente.

**Impacto:** Um clique duplicado (rede instável, duplo toque) gera pedidos duplicados, decrementando estoque duas vezes.

---

## 2. Latência geográfica

**Status:** ❌ Não implementado
**Severidade:** Média

**Evidência:**
- `agropet-cliente/src/data/datasources/supabase/client.ts` — Conexão direta ao Supabase (single region):
```ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
```
- Nenhum CDN configurado para assets estáticos (imagens, fontes, SVGs estão no bundle do app Expo).
- Nenhum arquivo de configuração Cloudflare, Fastly, ou edge cache no repositório.

**Impacto:** Todos os usuários servidos de uma única região Supabase. Latência alta para usuários distantes do datacenter.

---

## 3. Sistema caiu de madrugada (Observabilidade)

**Status:** ❌ Não implementado
**Severidade:** Crítica

**Evidência:**
- Nenhum health check endpoint. Nenhuma integração com Sentry, Datadog, Grafana, ou qualquer ferramenta de monitoramento.
- Nenhum sistema de alerta (PagerDuty, CloudWatch, etc.).
- `agropet-cliente/App.tsx` — Sem error boundary, sem logging estruturado.
- Único tratamento de erro são `console.error` e `Alert.alert` espalhados pelos componentes.

**Impacto:** Se o sistema cair às 3h, ninguém descobre até o cliente reclamar. Sem capacidade de diagnóstico pós-incidente.

---

## 4. IDOR — Usuário vê dados de outro

**Status:** ⚠️ Parcial (RLS no banco protege, mas sem verificação extra)
**Severidade:** Alta

**Evidência:**
- **RLS implementado em:**
  - `database/1. supabase_schema.sql:25-28` — Policy `user_isolation` na tabela `users`.
  - `database/16. fix_orders_rls.sql` — RLS para `orders` com `USING (user_id = auth.uid())`.
  - `database/17. fix_orders_update_rls.sql` — RLS para update em `orders`.
  - `database/15. fix_products_rls_for_orders.sql` — RLS para produtos.
  - `database/13. fix_store_settings_rls.sql` — RLS para configurações da loja.
  - `database/14. fix_store_location_rls.sql` — RLS para localização.

- **Client-side:** `agropet-cliente/src/presentation/screens/client/OrdersScreen.tsx:71-72` Filtra por `user?.id`:
```ts
.eq('user_id', user?.id)
```

**Risco:** Proteção depende 100% de RLS. Se uma policy estiver ausente ou mal configurada (como a policy `USING (true)` na `users`), IDOR é explorável. Não há validação no backend além do RLS.

---

## 5. Rate limit burlado por múltiplos IPs

**Status:** ❌ Não implementado
**Severidade:** Alta

**Evidência:**
- Nenhum rate limiting server-side no projeto.
- `database/7. rpc_finalizar_pedido.sql` — RPC pode ser chamado ilimitadamente.
- Único throttle encontrado: `lodash.throttle` em `package-lock.json` (client-side, para debounce de UI).

**Impacto:** Atacante com 1000 IPs consegue 1000x o limite individual. Sem API Gateway, sem Token Bucket, sem CAPTCHA.

---

## 6. Edição concorrente

**Status:** ⚠️ Parcial (row-level locking presente)
**Severidade:** Média

**Evidência:**
- `database/7. rpc_finalizar_pedido.sql:37-42` — `SELECT ... FOR UPDATE` trava linhas de produtos:
```sql
SELECT id, name, stock, active INTO v_product
FROM public.products
WHERE id = (v_item->>'product_id')::UUID
FOR UPDATE;
```

**Gap:** A transação inteira segura o lock, o que pode causar deadlocks sob alta concorrência. Não há tratamento de deadlock ou retry automático.

---

## 7. Pix confirmado mas pedido não gerado

**Status:** ❌ Não implementado (sem gateway de pagamento real)
**Severidade:** Crítica

**Evidência:**
- Nenhuma SDK de gateway de pagamento importada (Stripe, Mercado Pago, Asaas, Pagar.me).
- `PaymentScreen.tsx:114-121` — Chamada direta ao RPC `finalizar_pedido`. Não há webhook de confirmação, não há status intermediário "processando", não há reconciliação.
- Se a RPC falhar depois de um suposto pagamento, não há estorno automático nem retry.

**Impacto:** O sistema presume que pagamento sempre funciona. Em produção com gateway real, uma falha de rede entre gateway e banco geraria pedidos pagos sem registro.

---

## 8. Query lenta em 500M registros

**Status:** ❌ Não implementado
**Severidade:** Média

**Evidência:**
- Nenhum `CREATE INDEX` em nenhum dos 19 arquivos SQL do diretório `database/`. Apenas índices implícitos via PRIMARY KEY e UNIQUE.
- Nenhuma query com `EXPLAIN ANALYZE` ou plano de execução nos arquivos.
- `database/1. supabase_schema.sql` — Tabelas `orders`, `order_items`, `products` sem índices em colunas de busca frequente (`user_id`, `status`, `created_at`).

**Impacto:** Com crescimento, queries de filtro por `user_id` ou `status` farão full table scan. Sem paginação em diversas queries.

---

## 9. Escala vertical vs horizontal

**Status:** ❌ Não implementado
**Severidade:** Média

**Evidência:**
- Nenhum Dockerfile, docker-compose, load balancer, ou configuração de auto-scaling.
- Aplicação depende exclusivamente da infraestrutura gerenciada do Supabase.
- Nenhuma configuração de read replicas, connection pooling, ou multi-região.
- `package.json` — Apenas dependências de app mobile. Sem configuração de servidor.

**Impacto:** Sem estratégia de escalabilidade. Crescimento limitado ao plano Supabase contratado.

---

## 10. Condição de corrida no estoque

**Status:** ✅ Mitigado (FOR UPDATE + trigger de restauro)
**Severidade:** Alta (mitigado)

**Evidência:**
- `database/7. rpc_finalizar_pedido.sql:37-42` — `SELECT ... FOR UPDATE` impede race condition de leitura simultânea de estoque.
- `database/7. rpc_finalizar_pedido.sql:123-125` — Decremento atômico:
```sql
UPDATE public.products
SET stock = stock - (v_item->>'quantity')::INTEGER
WHERE id = (v_item->>'product_id')::UUID;
```
- `database/8. trigger_restore_stock_on_cancel.sql:1-24` — Trigger restaura estoque automaticamente quando pedido é cancelado.

**Observação:** Funciona bem para volume atual. Sem proteção contra estoque negativo (CHECK constraint ausente).

---

## 11. Funciona na minha máquina (Docker)

**Status:** ❌ Não implementado
**Severidade:** Média

**Evidência:**
- Nenhum arquivo Docker (Dockerfile, docker-compose.yml, .dockerignore) em todo o repositório.
- Projeto não containerizado.

**Impacto:** Setup manual de ambiente. Diferenças entre máquinas dos devs podem causar bugs de ambiente.

---

## 12. Email + notificação + estoque pós-compra

**Status:** ⚠️ Parcial
**Severidade:** Alta

**Evidência:**
- **Push notification:** `agropet-cliente/src/services/notificationService.ts:41-55` — `scheduleLocalNotification` e `sendPushNotification` existem para notificações locais/Expo push.
- **Push token storage:** `database/4. add_push_token.sql` — Coluna `push_token` na tabela `users`.
- **Trigger de estoque:** `database/8. trigger_restore_stock_on_cancel.sql` — Restaura estoque ao cancelar.
- **Sem email:** Nenhuma integração com serviço de email (SendGrid, Resend, Amazon SES).

**Gap:** Notificações push não são integradas com o fluxo de pedidos (só chamadas manuais). Email inexistente. Sem retry ou dead letter queue para notificações falhas.

---

## 13. Deploy deu erro na sexta

**Status:** ❌ Não implementado
**Severidade:** Crítica

**Evidência:**
- Nenhum CI/CD pipeline (GitHub Actions, GitLab CI, EAS Build).
- Nenhum feature flag system.
- Nenhum deploy gradual ou canário.
- Nenhum health check automático para rollback.
- Nenhum script de rollback.

**Impacto:** Deploy é manual. Erro em produção afeta 100% dos usuários. Rollback requer intervenção manual sem automação.

---

## 14. Indexou tudo e o banco piorou

**Status:** ❌ Não implementado (mas por falta, não excesso)
**Severidade:** Baixa

**Evidência:**
- Zero índices explícitos em 19 arquivos SQL (excluindo PKs implícitos).
- O problema aqui é o oposto: **falta** de índices, não excesso.

**Recomendação:** Criar índices estratégicos (`user_id`, `status`, `created_at`) em vez de sair indexando tudo. Usar `EXPLAIN ANALYZE` antes de criar índices.

---

## 15. Sincronização offline

**Status:** ⚠️ Parcial
**Severidade:** Média

**Evidência:**
- `agropet-cliente/src/data/datasources/sqlite/database.ts:6-46` — SQLite local com tabelas `cart`, `products_cache`, `orders_cache`, `sync_queue`.
- `agropet-cliente/src/data/datasources/sqlite/syncQueue.ts:27-71` — `SyncQueueService` com `enqueue`, `getPendingOperations`, `markAsSynced`, `synchronize`.
- `agropet-cliente/src/data/datasources/sqlite/syncQueue.ts:79-121` — `ProductCacheService` com cache de produtos offline.

**Gap:**
- `syncQueue.ts:47-71` — `synchronize` só processa `INSERT` em `orders`. Não trata `UPDATE`/`DELETE`.
- Sem detecção automática de conectividade (sem `@react-native-community/netinfo`).
- Sem estratégia de conflito (last-write-wins é o padrão implícito).
- Admin app não tem offline.

---

## 16. Status do pedido no AgroPet

**Status:** ✅ Implementado
**Severidade:** — (atende ao requisito)

**Evidência:**
- `agropet-cliente/src/presentation/screens/client/TrackingScreen.tsx:46-51` — `ThermometerLine` com timeline visual de 4 passos (Confirmado → Preparação → Saiu para Entrega → Concluída).
- `agropet-cliente/src/presentation/screens/client/TrackingScreen.tsx:130-267` — Cada passo com ícone, cor e indicador de status.
- `agropet-cliente/src/presentation/screens/client/OrderDetailScreen.tsx` — Card animado com glow pulsante por status.
- `agropet-cliente/src/presentation/screens/client/OrdersScreen.tsx` — Lista de pedidos com seções "Em entrega" e "Histórico".
- `database/1. supabase_schema.sql:4-7` — Enum `order_status` com 6 estados.

**Gap:** TrackingScreen é estática (não reflete o status real do banco em tempo real). Sem notificação push integrada à mudança de status.

---

## 17. 10k req/s de um único usuário

**Status:** ❌ Não implementado
**Severidade:** Alta

**Evidência:**
- Mesmo diagnóstico do item #5 — sem rate limiting, sem API Gateway, sem Token Bucket.
- `database/7. rpc_finalizar_pedido.sql:37-42` — O lock `FOR UPDATE` se tornaria gargalo sob 10k req/s, causando fila de transações e timeout.

**Impacto:** Um único script malicioso derruba o sistema.

---

## 18. Deletou conta e quer recuperar

**Status:** ❌ Não implementado
**Severidade:** Média

**Evidência:**
- Nenhuma coluna `deleted_at` ou `active` para soft delete em tabelas de usuários.
- Nenhuma funcionalidade de exclusão de conta (nem soft nem hard) nos apps.
- Apenas `products` tem campo `active` para desativação (`database/9. trigger_auto_deactivate.sql`).
- Sem funcionalidade de exportação de dados (LGPD).

**Impacto:** Usuário não consegue deletar a conta pelo app. Se deletada manualmente no Supabase, não há recuperação possível.

---

## 19. Notificação push para 50M usuários

**Status:** ❌ Não implementado (estrutura local apenas)
**Severidade:** Média

**Evidência:**
- `agropet-cliente/src/services/notificationService.ts:41-55` — Notificações enviadas diretamente do dispositivo via Expo Push API.
- Sem fila de notificações (Bull, RabbitMQ, Redis).
- Sem workers paralelos para envio em lote.
- Sem segmentação/particionamento de usuários.
- Sem rate limiting de envio (FCM/APNs limitam).
- Sem rastreamento de entrega ou dead letter queue.
- Sem listeners de notificação registrados no `App.tsx`.

**Impacto:** Para 50M usuários, o modelo atual (dispositivo → Expo) não escala. Sem server-side, sem fila, sem retry.

---

## Anexo: Arquivos Analisados

| Arquivo | Linhas | Relevância |
|---------|--------|------------|
| `database/1. supabase_schema.sql` | 60 | Schema geral, RLS `user_isolation` |
| `database/7. rpc_finalizar_pedido.sql` | 155 | RPC atômico com FOR UPDATE |
| `database/8. trigger_restore_stock_on_cancel.sql` | 24 | Trigger de restauro de estoque |
| `database/9. trigger_auto_deactivate.sql` | — | Auto-desativa produto (stock=0) |
| `database/4. add_push_token.sql` | — | Coluna push_token |
| `database/13-19. fix_*_rls.sql` | vários | Correções RLS |
| `PaymentScreen.tsx` | 529 | Fluxo de pagamento |
| `TrackingScreen.tsx` | 504 | Timeline visual de status |
| `OrdersScreen.tsx` | — | Lista de pedidos |
| `OrderDetailScreen.tsx` | — | Detalhe com animação |
| `notificationService.ts` | 62 | Serviço de notificação |
| `sqlite/database.ts` | 50 | SQLite offline |
| `sqlite/syncQueue.ts` | 122 | Fila de sincronização |
| `CartContext.tsx` | 110 | Carrinho offline-first |
| `AuthContext.tsx` | 122 | Autenticação |
