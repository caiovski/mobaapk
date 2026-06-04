# Restore Point — 04/06/2026

## Sessão
TrackingScreen + AdminOrderDetail — GPS, status, layout, cores, confirmed_at

## Estado Atual

### TrackingScreen (cliente)
- 4 etapas com 3 termômetros pulsantes (shared glow)
- `en_route` automático via GPS < 200m
- StepStatus mapeado explicitamente (não usa `getFocusIdx`)
- `getOuterStatus`: check+check=check, check+warn=warn, warn+red=red, red+red=red
- Step4 ícone/outer separados — vermelhos até `completed`
- Pull-to-refresh com RefreshControl
- `stepTimestamp(0)` = `confirmed_at || created_at`
- Horário absoluto (`top:9, fontSize:13`) separado do relógio centralizado

### AdminOrderDetail
- Botão sempre visível (nunca escondido)
- Labels: "Pedido preparado!" p/ preparing/delivering; "Concluir entrega" se departed
- Cores: preparing/delivering = `#2E7D32` verde escuro; cancelled = cinza
- `isButtonDisabled`: cancelled, completed, delivering && !departed
- `handleCombinedDelivery`: `update_order_status('delivering')` + `mark_delivery_departure`

### Database
- Migration 38: `en_route_at`, `mark_delivery_departure`, `mark_en_route`, `update_order_status` ajustado
- Migration 39: `confirmed_at`, RPCs atualizados (`update_order_status`, `confirm_pix_payment`, `finalizar_pedido`)

### Shop/Bypass
- `shopHours.ts` bypass **removido** — loja agora fecha conforme horário real

### Outros
- Realtime channels com nomes únicos (timestamp+random) — sem conflito
- SQLite `initDB` singleton, sem PRAGMA WAL
- PaymentConfirmScreen não-PIX centralizado verticalmente
- ProductDetailScreen tab bar bottom corrigido (iOS 34, Android 24)
- OrdersScreen: `deliveryOrders` inclui `preparing` e `delivering`
- Tests do `getShopStatus` continuam skipados

### Pendente
- Rodar migration 39 no Supabase SQL Editor
