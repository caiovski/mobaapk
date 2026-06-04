# Plano de Implementação — AgroPet Lambari

> **Baseado na auditoria** (vide `relatorio-auditoria-tecnica.md`)
> **Priorização:** Impacto no usuário + Risco de negócio + Esforço

---

## Prioridade 1 —🔥 Crítico (Segurança + Dinheiro)

### P1. Idempotência no pagamento (Item #1)
**Esforço:** 3 dias
**Arquivos:**
- `database/7. rpc_finalizar_pedido.sql` — Adicionar parâmetro `p_idempotency_key` + tabela `idempotency_keys` + UNIQUE constraint
- `PaymentScreen.tsx` — Gerar UUID no cliente, enviar como parâmetro, desabilitar botão com loading state (já existe parcialmente)
- `database/` — Nova migration: `20. idempotency_keys.sql`

**O que fazer:**
1. Criar tabela `idempotency_keys(id UUID PK, created_at TIMESTAMPTZ)` com TTL (expirar após 24h)
2. Modificar RPC: no início, verificar se `p_idempotency_key` já foi processado → se sim, retornar pedido existente
3. Client-side: gerar UUID v4 antes da chamada, passar como `p_idempotency_key`

### P2. RLS + Autorização (Item #4)
**Esforço:** 2 dias
**Arquivos:**
- `database/` — Revisar TODAS as tabelas para garantir que cada uma tem `FOR ALL USING (auth.uid() = user_id)` ou policy equivalente
- `database/` — Remover `USING (true)` da tabela `users` (policy atual permite qualquer um ver qualquer usuário)
- `agropet-admin/` — Adicionar validação de role no backend (admin check em cada RPC sensível)

**O que fazer:**
1. Auditar todas as 19 tabelas no schema — garantir RLS ativo + policy restritiva
2. Criar migration `21. rls_audit_fix.sql`
3. Adicionar `SECURITY DEFINER` + verificação de `auth.role()` = `admin` nas RPCs do admin

### P3. Rate limiting (Itens #5 e #17)
**Esforço:** 2 dias
**Arquivos:**
- `database/` — Nova migration `22. rate_limiter.sql` com tabela de contagem
- `agropet-cliente/` e `agropet-admin/` — Adicionar middleware/throttle nas chamadas Supabase

**O que fazer:**
1. Criar tabela `request_logs(user_id UUID, endpoint TEXT, created_at TIMESTAMPTZ)` com índice em `(user_id, created_at)`
2. Criar RPC `check_rate_limit(p_user_id, p_endpoint, p_max_requests, p_window_seconds)` que consulta e insere atômicamente
3. No frontend: antes de cada ação sensível (finalizar_pedido, login), chamar o RPC de rate check
4. Retornar HTTP 429 amigável quando excedido

### P4. Confirmação Pix + Pedido (Item #7)
**Esforço:** 5 dias
**Arquivos:**
- `database/` — Nova migration `23. payment_flow.sql` com tabela `payment_transactions` + status intermediário
- `agropet-cliente/` — Adicionar tela de "processando pagamento" com polling de status
- `agropet-cliente/` — Integrar SDK de gateway (Mercado Pago/Asaas)

**O que fazer:**
1. Adicionar status `'processing'` no enum `order_status`
2. Criar tabela `payment_transactions(id UUID, order_id UUID FK, gateway TEXT, gateway_tx_id TEXT, status TEXT, amount DECIMAL, idempotency_key UUID UNIQUE, created_at TIMESTAMPTZ)`
3. Modificar fluxo: pedido começa como `'processing'`, gateway confirma → job atualiza para `'confirmed'`
4. Se falhar: estorno automático via RPC

---

## Prioridade 2 —🟡 Alto (Experiência do Usuário + Operação)

### P5. Observabilidade (Item #3)
**Esforço:** 3 dias
**Arquivos:**
- `agropet-cliente/App.tsx` — Adicionar Error Boundary + Sentry/Bugsnag
- `agropet-admin/App.tsx` — Idem
- `database/` — Nova migration `24. audit_log.sql`

**O que fazer:**
1. Adicionar `@sentry/react-native` em ambos os apps
2. Criar Error Boundary wrapper em `app/` com fallback UI + log automático
3. Criar tabela `audit_logs(user_id UUID, action TEXT, metadata JSONB, created_at TIMESTAMPTZ)` em vez de console.log
4. Adicionar logger estruturado que grava em `audit_logs` para ações críticas (pedido criado, cancelado, login, erro)

### P6. CI/CD + Deploy Seguro (Item #13)
**Esforço:** 3 dias
**Arquivos:**
- `.github/workflows/` — Pipeline de CI/CD
- `app.json` — Config de build (EAS Build)
- `openspec/feature-flags/` — Sistema de feature flags

**O que fazer:**
1. Criar GitHub Actions workflow: `lint` → `test` → `build` (expo) → `deploy`
2. Configurar EAS Build + EAS Submit para OTA updates
3. Implementar feature flags simples: tabela `feature_flags(name TEXT, enabled BOOLEAN)` no Supabase
4. Criar RPC `check_feature_flag(p_name)` usado nos componentes críticos

### P7. Docker / Container (Item #11)
**Esforço:** 1 dia
**Arquivos:**
- `Dockerfile` (root) — Container para ambiente de dev
- `docker-compose.yml` — Supabase local + app

**O que fazer:**
1. Criar Dockerfile com Node + Expo CLI
2. Criar docker-compose com Supabase local (usando `supabase/pg` + `supabase/realtime`)
3. Documentar no README

### P8. Deletar conta + Soft Delete (Item #18)
**Esforço:** 2 dias
**Arquivos:**
- `database/` — Nova migration `25. soft_delete_users.sql` com coluna `deleted_at`
- `agropet-cliente/src/presentation/screens/client/SettingsScreen.tsx` — Botão "Excluir conta"
- `agropet-cliente/` — Fluxo de confirmação + período de carência

**O que fazer:**
1. Adicionar `deleted_at TIMESTAMPTZ` e `scheduled_delete_at TIMESTAMPTZ` na tabela `users`
2. Atualizar RLS para ignorar `deleted_at IS NOT NULL`
3. Criar RPC `request_account_deletion()` com carência de 30 dias
4. Criar RPC `cancel_account_deletion()` para reativar dentro da carência
5. Tela de confirmação com aviso de 30 dias + exportação de dados

---

## Prioridade 3 —🟠 Médio (Performance + Escalabilidade)

### P9. Índices no banco (Itens #8 e #14)
**Esforço:** 2 dias
**Arquivos:**
- `database/` — Nova migration `26. performance_indexes.sql`

**O que fazer:**
1. Analisar queries mais comuns com `EXPLAIN ANALYZE` em dados de staging
2. Criar índices:
   - `orders(user_id, status, created_at DESC)` — listagem de pedidos
   - `order_items(order_id)` — FK já implicado, confirmar
   - `products(active, name)` — catálogo de busca
   - `users(email)` — login
3. Adicionar comentários explicando cada índice
4. Criar job periódico para `REINDEX` e `ANALYZE`

### P10. Sincronização offline (Item #15)
**Esforço:** 4 dias
**Arquivos:**
- `agropet-cliente/src/data/datasources/sqlite/syncQueue.ts` — Completar operações UPDATE/DELETE
- `agropet-cliente/` — Adicionar `@react-native-community/netinfo`
- `agropet-cliente/src/contexts/ConnectivityContext.tsx` — Monitor de conectividade
- `agropet-cliente/App.tsx` — Registrar listener de conectividade, acionar sync automático

**O que fazer:**
1. Completar `synchronize()` no syncQueue para tratar `UPDATE` e `DELETE` em todas as tabelas
2. Criar `ConnectivityContext` que escuta mudanças de rede com `netinfo`
3. Quando reconectar: disparar `synchronize()` automaticamente
4. Implementar estratégia de conflito: timestamp-based (last-write-wins com alerta)
5. Admin app: criar estrutura offline básica (cache de produtos + fila de pedidos)

### P11. Notificação push pós-compra (Itens #12 e #16)
**Esforço:** 3 dias
**Arquivos:**
- `agropet-cliente/App.tsx` — Registrar `addNotificationReceivedListener` para navegação
- `agropet-cliente/src/services/notificationService.ts` — Integrar com fluxo de pedido
- `database/` — Trigger `notify_order_status_change` no Supabase
- `agropet-admin/` — Registrar push token + enviar atualizações

**O que fazer:**
1. No `App.tsx`: registrar listener que navega para tela de pedido ao receber notificação
2. Criar função `sendOrderStatusNotification(orderId, status)` no notificationService
3. No RPC `finalizar_pedido`, após sucesso: enviar notificação push via Expo
4. Trigger no banco: `ON UPDATE OF status ON orders → notify` (edge function no Supabase)
5. Admin: ao mudar status do pedido, enviar push notification para o cliente

---

## Prioridade 4 —🔵 Baixo (Futuro / Diferenciação)

### P12. Latência geográfica (Item #2)
**Esforço:** 2 dias
**Arquivos:**
- `agropet-cliente/` — Configurar CDN para imagens (Supabase Storage já entrega via CDN)
- `supabase/` — Configurar edge functions em múltiplas regiões

**O que fazer:**
1. Verificar se imagens no Supabase Storage estão usando o CDN embutido
2. Se não: configurar cache headers e transformações de imagem
3. Para API: considerar edge functions do Supabase que rodam próximas ao usuário

### P13. Escala horizontal (Item #9)
**Esforço:** 1 dia (análise)
**Arquivos:**
- `docs/architecture/scale-strategy.md`

**O que fazer:**
1. Documentar estratégia de escala: começar com plano Supabase Pro (escala vertical automática)
2. Preparar app para statelessness (já é mobile, então é inerentemente stateless)
3. Futuro: connection pooling + PgBouncer + read replicas

### P14. Feature Flags (Item #13, parte 2)
**Esforço:** 1 dia
**Arquivos:**
- `agropet-cliente/src/contexts/FeatureFlagContext.tsx`

**O que fazer:**
1. Implementar FeatureFlagContext que consulta `feature_flags` no Supabase
2. Adicionar flag `nova_payment_flow`, `dark_mode_enabled`, etc
3. Wrapper `<FeatureFlag name="feature_x"><Component /></FeatureFlag>`

### P15. Push notification para grande escala (Item #19)
**Esforço:** 5 dias (quando necessário)
**Arquivos:**
- `supabase/edge-functions/send-push.js` — Edge function no Supabase
- `database/` — Tabela `push_queue`

**O que fazer (futuro):**
1. Criar edge function `send-push` que processa fila de push tokens
2. Rate limiting respeitando limites do FCM/APNs
3. Dead letter queue para tokens expirados
4. Particionamento por segmento de usuários

---

## Roadmap Recomendado

```
Semana 1-2  │ P1 Idempotência  │ P2 RLS/Autorização  │ P3 Rate Limit
Semana 3-4  │ P4 Pagamento     │ P5 Observabilidade  │ P8 Soft Delete
Semana 5-6  │ P6 CI/CD         │ P7 Docker           │ P9 Índices
Semana 7-8  │ P10 Offline      │ P11 Push Notif      │
Futuro      │ P12-P15 (CDN, Feature Flags, Escala, Push 50M)
```

## Resumo de Esforço

| Prioridade | Itens | Dias Est. | Impacto |
|-----------|-------|-----------|---------|
| 🔥 P1 | 4 | 12 | Segurança + Dinheiro |
| 🟡 P2 | 4 | 9 | Operação + UX |
| 🟠 P3 | 3 | 9 | Performance |
| 🔵 P4 | 4 | 9 | Diferenciação |
| **Total** | **15** | **39** | |
