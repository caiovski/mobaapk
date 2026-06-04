# Sessão: 19/19 Auditoria Técnica AgroPet — 31/05/2026

## Contexto
Usuário trouxe 19 perguntas de auditoria técnica. Trabalhamos em 2 blocos:
- **Bloco 1 (sessão anterior):** #1 idempotência, #2 CDN, #3 observabilidade, #4 RLS, #5 rate limit, #7 PIX, #8/#14 índices, #10 estoque
- **Bloco 2 (esta sessão):** #6 concorrência, #9 escala, #12 email/notificação, #13 CI/CD, #15 offline, #16 push 50M, #18 LGPD, #11 Docker

## O que foi feito nesta sessão

### #6 Concorrência
- `database/30. concurrent_editing.sql`: `FOR UPDATE NOWAIT` + `SET LOCAL lock_timeout = '5000'`
- Produtos ordenados por ID para evitar deadlock
- Retry com backoff (1s, 2s, 4s, max 3) em `usePaymentScreen.tsx`

### #9 Escala
- `docs/architecture/scale-strategy.md`: fases PgBouncer → read replicas → Redis → edge functions
- `.limit(200)` em `useManageProductsScreen.tsx`
- `.limit(100)` em `useAdminDashboard.ts`
- Ajuste de mocks nos testes (encadear `.limit()`)

### #12 Email + Notificação
- `database/32. notification_queue.sql`: tabela + trigger `trg_notify_order_status`
- `update_order_status` RPC com transições válidas (processing→confirmed→preparing→delivering→completed)
- `notificationService.ts` com Expo Push API
- Listeners em `App.tsx` (admin e cliente)
- Botões de avanço de status em `AdminOrderDetailScreen.tsx`

### #13 CI/CD
- `.github/workflows/ci-cliente.yml`: push/PR na main, ubuntu-latest, Node 20, `npm ci` + `npm test`
- `.github/workflows/ci-admin.yml`: mesmo padrão

### #15 Offline
- `@react-native-community/netinfo` instalado no cliente
- `ConnectivityContext.tsx`: monitor + auto-sync + `SyncQueueService`, `ProductCacheService`, `OrdersCacheService`
- SQLite `agropet_cart.db` com tabelas: cart, products_cache, orders_cache, sync_queue
- Cache de produtos (HomeScreen) e pedidos (OrdersScreen)
- Enfileiramento de pedidos offline em `usePaymentScreen.tsx`
- `synchronize()` cobre INSERT/UPDATE/DELETE em qualquer tabela

### #16 Push 50M
- `supabase/edge-functions/send-push/index.ts`: edge function que consome notification_queue, envia via Expo Push API
- `database/33. push_queue_dlq.sql`: colunas sent_at, failed_at, retry_count + view dlq_notifications + reprocess_dlq()

### #18 LGPD
- `database/31. lgpd_soft_delete.sql`: soft delete com 30 dias de carência
- RPCs: `request_account_deletion`, `cancel_account_deletion`, `export_user_data`, `hard_delete_expired_accounts`
- Botões "Baixar meus dados", "Excluir conta", "Reativar conta" no SettingsScreen
- `DeletedUsersModal.tsx` no admin + `useAdminSettingsDeletedUsers.ts`

### #11 Docker
- `docker-compose.yml`: PostgreSQL 15 + PgBouncer + gotrue + realtime + storage + postgrest + studio + edge functions
- `Dockerfile` + `.env.example`

## Decisões Técnicas
- PIX: sem gateway real — chave PIX em `store_settings` + confirmação manual
- IDOR protegido server-side (RPC guards), sem layer de autorização no cliente
- `expo-image` escolhido sobre FastImage (compatibilidade Expo SDK 54)
- Rate limit por `auth.uid()` (não por IP)
- Offline: SQLite cache local + ConnectivityContext global + auto-sync na reconexão
- Push: Expo Push API (sem edge function para envio direto do cliente com fallback para edge function)
- migrations: numeradas de 22 a 33 (seguindo sequência existente)

## Estado Final
- **19/19 audit items concluídos ✅**
- **845 testes passando** (592 admin + 253 cliente)
- Commit: `9dbecea`

## Para retomar
- Próximos passos possíveis: revisão das implementações, novos testes, deploy, melhorias de UI/UX
