# Tarefas: Correção de bugs do sistema "à granel" no PDV Admin

## 1. Unificar `order_items.quantity` para Kg em todos os modos

### 1.1 Converter g → Kg no insert de order_items (modo g)
- [x] **Implementação:** Em `useAdminDashboardPdv.ts`, alterar `quantity: qty` para `quantity: unit === 'g' ? qty / 1000 : qty`

## 2. Corrigir exibição no CheckoutModal

### 2.1 Passar bulkInputUnit para o CheckoutModal
- [x] **Implementação:** Adicionar `bulkInputUnit` como prop no `CheckoutModal` e no `AdminDashboardScreen`

### 2.2 Calcular total correto para unidade 'g'
- [x] **Implementação:** No `CheckoutModal`, quando `item.is_bulk && bulkValueMode && bulkInputUnit[item.id] === 'g'`, dividir qty por 1000 no cálculo do total

## 3. Implementar restauração de estoque no cancelamento

### 3.1 `useOrderMutations.ts` — restaurar estoque antes de cancelar
- [x] **Implementação:** Adicionar `restoreStockOnCancel()` que busca `order_items` e `products(is_bulk)`, calcula gramas e atualiza `products.stock`

### 3.2 `useAdminOrderDetail.ts` — restaurar estoque antes de cancelar
- [x] **Implementação:** Mesma lógica do 3.1, adaptada ao fluxo do RPC `update_order_status`

## 4. Nova Migration

### 4.1 Alterar order_items.quantity de INTEGER para NUMERIC(10,3)
- [x] **Implementação:** Migration `51. alter_order_items_quantity_type.sql` — permite armazenar decimais (0,5 Kg, 1,5 m etc.)

## 5. Correção de Exibição (Admin)

### 5.1 Formatar Qtd em AdminOrderDetailScreen
- [x] **Implementação:** Criado `utils/formatOrderItemQuantity.ts` com `formatOrderItemQuantity()` e `formatOrderItemUnitPrice()`. AdminOrderDetailScreen agora mostra "1,500 Kg", "500g", "2,50 m", "0,5 m"

### 5.2 Buscar is_bulk/is_per_meter nas queries
- [x] **Implementação:** `useAdminOrderDetail.ts` e `useAdminConsultSales.tsx` agora incluem `is_bulk` e `is_per_meter` no SELECT dos produtos

### 5.3 Vírgula no input Kg/m do PDV
- [x] **Implementação:** PDVSection agora exibe `String(inCart.qty).replace('.', ',')` para mostrar vírgula no campo de texto

## 6. Correção no Cliente

### 6.1 Formatar Qtd em CartScreen e PaymentScreen
- [x] **Implementação:** Criadas funções `formatCartItemQty()` e `formatPaymentQty()` que formatam "1,500 Kg", "500g", "2,50 m", "0,5 m"

### 6.2 Teclado decimal-pad para bulk/meter
- [x] **Implementação:** ProductDetailScreen agora usa `keyboardType="decimal-pad"` em vez de `"numeric"` para permitir vírgula

## 7. Suporte a metro (m) no PDV Admin

### 7.1 Input decimal para produtos por metro
- [x] **Implementação:** PDVSection trata `item.is_per_meter` com input decimal (parseFloat) e exibe sufixo "m"

### 7.2 Restauração de estoque para per_meter
- [x] **Implementação:** Ambos `restoreStockOnCancel()` usam `Math.round(item.quantity)` para per_meter

## 8. Segurança contra ponto flutuante

### 8.1 Math.round nas deduções de estoque
- [x] **Implementação:** `handleConfirmPdvSale` usa `Math.round(qty * 1000)` para bulk e `Math.round(qty)` para per_meter

## 9. Validação

### 9.1 Testes automatizados
- [x] Admin: 87 suites, 1124 testes — todos passando
- [x] Cliente: 53 suites, 377 testes — todos passando
