# Proposta: Correção de bugs do sistema "à granel" no PDV Admin

## Resumo

O sistema de venda de produtos à granel (por Kg, g ou R$) no PDV do Admin contém 3 bugs interligados que afetam o cálculo de estoque, o valor exibido no checkout e a restauração de estoque no cancelamento.

## Bugs Identificados

### Bug 1: Cancelamento devolve valor errado em Kg
Quando uma venda com produto à granel em **Kg** é cancelada, o estoque não é restaurado corretamente (ou não é restaurado). `order_items.quantity` está em Kg, mas o cancelamento não converte para gramas.

### Bug 2: Modo "g" interpreta como Kg no checkout
Quando o admin seleciona **gramas (g)** e digita um valor (ex: 500g), o **CheckoutModal** exibe o total como `500 × R$14 = R$ 7.000,00` ao invés de `0,5 × R$14 = R$ 7,00`. O modal não considera a unidade selecionada no cálculo.

### Bug 3: Modo R$ não exibe produto nos detalhes e não restaura estoque
No modo "Mudar à granel OFF" (digitar valor em R$), após fechar a venda o produto não aparece nos detalhes da venda (Consultar Vendas) e o cancelamento não restaura o estoque.

## Causa Raiz

1. **`order_items.quantity`** é armazenado em unidades inconsistentes para produtos à granel:
   - Modo Kg: armazena em Kg (ex: `1.0`)
   - Modo g: armazena em gramas (ex: `500`)
   - Modo R$: armazena em Kg (ex: `1.0`)
   
   Isso impossibilita a restauração correta de estoque no cancelamento.

2. **Cancelamento não restaura estoque**: Ambos `handleCancelOrder` em `useOrderMutations.ts` e `useAdminOrderDetail.ts` apenas alteram o status do pedido para `'cancelled'`, sem nunca restaurar `products.stock`.

3. **CheckoutModal** calcula o total de itens à granel como `preço × qtd` sem considerar se a unidade é gramas.

## Solução

1. Unificar `order_items.quantity` para **sempre em Kg** para produtos à granel (converter g → Kg no momento do insert)
2. Implementar restauração de estoque no cancelamento, convertendo Kg → gramas (`qty × 1000`)
3. Corrigir CheckoutModal para exibir total correto quando unidade é 'g'
