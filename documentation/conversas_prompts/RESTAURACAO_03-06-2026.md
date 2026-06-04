# Restauração — 03/06/2026

## Alterações feitas

### 1. TrackingScreen em Tempo Real (Cliente)

**Arquivos:**
- `agropet-cliente/src/presentation/screens/client/Tracking/useTrackingScreen.ts`
- `agropet-cliente/src/presentation/screens/client/Tracking/TrackingScreen.tsx`

**O que faz:**
- Três status por etapa: `check` (✅), `warn` (⚠), `red` (❌)
- `getFocusIdx()` mapeia status do pedido → qual etapa é o foco atual
  - `confirmed` → foco etapa 2 (preparing ⚠)
  - `preparing` → foco etapa 3 (preparing ✅, delivering ⚠)
  - `delivering` → foco etapa 4 (delivering ✅, completed ⚠)
  - `completed` → todas ✅
- `outerStatuses[i]` mostra o pior status entre etapa `i` e `i+1`
- Step 1 outer sempre mostra o próprio status (check)
- Sub-ícones de Step 2 e Step 3 têm lógica independente (`step2SubStatuses`, `step3SubStatuses`)
- Horário usa `prepared_at`, `delivering_at` ou relógio colorido (amarelo p/ warn, vermelho p/ red)

**Ícones por sub-etapa (Step 2):**
| Status | "Em preparação" | "Preparado" |
|--------|:-:|:-:|
| confirmed | ⚠ | ❌ |
| preparing | ✅ | ⚠ |
| delivering | ✅ | ✅ |
| completed | ✅ | ✅ |

**Ícones por sub-etapa (Step 3):**
| Status | "Saiu p/ entrega" | "À caminho" |
|--------|:-:|:-:|
| confirmed | ❌ | ❌ |
| preparing | ⚠ | ❌ |
| delivering | ✅ | ⚠ |
| completed | ✅ | ✅ |

### 2. Colunas `prepared_at` / `delivering_at` no BD

**Arquivo:** `database/37. add_tracking_timestamps.sql`

- `ALTER TABLE orders ADD COLUMN prepared_at TIMESTAMPTZ`
- `ALTER TABLE orders ADD COLUMN delivering_at TIMESTAMPTZ`
- RPC `update_order_status` atualizada para setar:
  - `prepared_at` em `confirmed→preparing` e `preparing→delivering` (substitui)
  - `delivering_at` em `preparing→delivering`

### 3. Botões do Admin

**Arquivo:** `agropet-admin/src/.../useAdminOrderDetail.ts`

- `preparing→delivering`: "Sair para Entrega" → **"Checar Pedido Preparado"**
- `delivering→completed`: "Concluir Entrega" → **"Saiu para a entrega"**

### 4. Pix Pendente — Botão Cinza no Admin

**Arquivos:**
- `agropet-admin/src/.../useAdminOrderDetail.ts` — nova flag `isPixPending`
- `agropet-admin/src/.../AdminOrderDetailScreen.tsx` — botão cinza desabilitado

**Regra:** Quando `payment_method === 'pix' && status === 'processing'`, o botão de avançar fica cinza (#A0A0A0) e sem ação.

### 5. Situação do Pagamento na Lista de Pedidos

**Arquivo:** `agropet-admin/src/.../AdminOrdersScreen.tsx`

**Nova lógica:**
- Cancelado → "Cancelado"
- Pix + processing → "Pendente"
- Todo o resto → "Aprovado"

### 6. NotificaçãoService — Path Fix

**Arquivo:** `agropet-admin/src/services/notificationService.ts:96`

- `require('../../data/...')` → `require('../data/...')`

### 7. Store Lock / Contador Reativado

**Arquivo:** `agropet-cliente/src/utils/shopHours.ts:101-103`

- Removido o `return { isOpen: true... }` que bypassava toda a lógica de horário
- Agora o cliente vê o contador regressivo e a loja fecha nos horários corretos (dias úteis 8-18h, sábados 8-12h, domingos fechado)

## Pendências / Próximos passos
- [ ] Aplicar migration `37. add_tracking_timestamps.sql` no Supabase
- [ ] Testar fluxo completo: admin avança status → cliente vê atualização em tempo real
- [ ] Verificar se `'processing'` deve aparecer na lista de pedidos do admin (hoje está filtrado)
