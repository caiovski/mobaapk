# Design: Correção de bugs do sistema "à granel" no PDV Admin

## Fluxo de Dados Atual (problemático)

```
PDV venda (modo g):
  pdvCart.qty = 500 (gramas)
  order_items.quantity = 500 (gramas) ← inconsistente!
  products.stock -= 500 (gramas) ← OK
  products.stock é em gramas, order_items.quantity também é em gramas

Cancelamento:
  Lê order_items.quantity = 500
  Deveria: products.stock += 500 (já está em gramas)
  Mas se tratar como Kg: products.stock += 500 * 1000 = ERRO
```

## Fluxo de Dados Corrigido

```
PDV venda (qualquer modo):
  order_items.quantity = sempre em Kg para bulk
  - Modo Kg: qty em Kg → armazena qty
  - Modo g: qty em g → armazena qty / 1000
  - Modo R$: qtyInKg = value / price → armazena qtyInKg

  products.stock -= qtyEmGramas (stock é sempre em gramas)

Cancelamento:
  Lê order_items.quantity (sempre em Kg)
  products.stock += quantity * 1000 (converte Kg → gramas)
```

## Alterações Específicas

### 1. `useAdminDashboardPdv.ts` (linhas 237-251)
**Problema**: No modo 'g', `order_items.quantity` armazena o valor em gramas.
**Correção**: Converter para Kg antes de inserir:
```typescript
// Antes:
quantity: qty,  // 500 (gramas)
// Depois:
quantity: unit === 'g' ? qty / 1000 : qty,  // 0.5 (Kg)
```

### 2. `CheckoutModal.tsx` (linhas 134-148)
**Problema**: Exibe total como `item.price * qty` sem considerar unidade 'g'.
**Correção**: Quando estiver em Kg/g mode (não R$ mode) e a unidade for 'g', usar `qty / 1000` no cálculo.

O CheckoutModal não tem acesso ao `bulkInputUnit`, então precisamos passar via props. Mas uma abordagem mais simples é: para itens bulk em Kg/g mode, o `pdvCart.qty` já reflete o valor digitado. Precisamos saber se a unidade é 'g' para ajustar. Vamos adicionar `bulkInputUnit` como prop opcional no CheckoutModal.

### 3. `useOrderMutations.ts` (linhas 26-44)
**Problema**: Cancelamento não restaura estoque.
**Correção**: Antes de atualizar status, buscar `order_items` e restaurar stock:
- Para bulk (`is_bulk`): `stock += quantity * 1000`
- Para normal: `stock += quantity`

### 4. `useAdminOrderDetail.ts` (linhas 391-427)
**Problema**: Mesmo que o #3 - cancelamento via RPC `update_order_status` não restaura estoque.
**Correção**: Antes de chamar RPC, buscar order_items e restaurar manualmente.

### 5. `useAdminDashboardPdv.ts` — Tratamento de totalVenda
O cálculo de `totalVenda` nas linhas 199-206 JÁ está correto para 'g':
```
(unit === 'g' ? qty / 1000 : qty) * item.price
```
Não precisa alterar.

## Impacto

- **Nenhuma mudança no schema do banco**
- **Nenhuma migração SQL necessária**
- `order_items.quantity` para bulk sempre em Kg (consistente com R$ mode)
- Cancelamento funciona para TODOS os modos (Kg, g, R$)
- CheckoutModal exibe valores corretos
