## Context

O sistema Agropet atualmente trata `stock` como INTEGER (unidades inteiras) tanto no Supabase quanto no SQLite do cliente. RPCs como `finalizar_pedido` usam `(v_item->>'quantity')::INTEGER` e triggers como `restore_stock_on_cancel` usam `stock + v_item.quantity` — ambos compatíveis com valores inteiros.

A feature "Produto à granel" reutiliza `stock` como INTEGER em gramas (1 Kg = 1000 gramas), sem alterar schemas de banco, RPCs ou triggers. A diferença é puramente na camada de apresentação: formulários que convertem Kg/g para gramas, e exibições que formatam gramas de volta para Kg.

## Goals / Non-Goals

**Goals:**
- Adicionar coluna `is_bulk` à tabela `products` no Supabase (BOOLEAN, default false).
- Admin pode marcar um produto como "à granel" no cadastro e na edição.
- Estoque é armazenado em gramas (INTEGER) para produtos granel, sem mudar o tipo da coluna `stock`.
- Admin vê estoque formatado como "1,000 Kg" em vez de "1000 unidades".
- Cliente vê estoque como "X,XXX Kg" e pode digitar quantidades decimais em Kg ou g.
- Carrinho e pedido armazenam quantidade em gramas (INTEGER), compatível com RPCs e triggers existentes.
- Alertas de estoque crítico/moderado funcionam normalmente (thresholds em gramas).

**Non-Goals:**
- Mudança no schema do SQLite do cliente (cart table).
- Mudança nos RPCs `finalizar_pedido` ou trigger `restore_stock_on_cancel`.
- Suporte a múltiplas unidades (litro, metro, etc.) — apenas Kg/g.
- Produtos mistos (parte granel, parte unitário).

## Decisions

### 1. Armazenamento: INTEGER em gramas

- **Decisão**: Produtos granel armazenam `stock` como INTEGER em gramas. Ex: 1,5 Kg → `stock = 1500`.
- **Justificativa**: Nenhuma mudança de schema, RPC ou trigger. A coluna `stock INTEGER DEFAULT 0 NOT NULL` permanece. O CHECK `products_stock_non_negative` continua válido.
- `critical_stock` e `moderate_stock` também são INTEGER em gramas.

### 2. Coluna `is_bulk` no Supabase

```sql
ALTER TABLE public.products
  ADD COLUMN is_bulk BOOLEAN NOT NULL DEFAULT false;

-- Opcional: índice para consultas de produtos granel
CREATE INDEX idx_products_is_bulk ON public.products (is_bulk);
```

### 3. Conversão Kg ↔ gramas

| Operação | Fórmula |
|----------|---------|
| Admin digita `1,5` Kg salvar | `stock = parseFloat(valor) * 1000` → ex: `1500` |
| Admin digita `500` g salvar | `stock = parseInt(valor)` → ex: `500` |
| Exibir estoque (Kg) | `(stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' Kg'` |
| Exibir estoque (g) | `${stock} g` |

### 4. Formatação de exibição

Sempre que um produto `is_bulk === true` for exibido, o valor em gramas é convertido para Kg com 3 casas decimais e separador de milhar:

| Gramas | Exibição |
|--------|----------|
| 1000 | "1,000 Kg" |
| 1500 | "1,500 Kg" |
| 250 | "0,250 Kg" |
| 0 | "0,000 Kg" |

### 5. Admin - Toggle "Produto à granel"

```
┌──────────────────────────────────────┐
│  [Nome do produto]                   │
│  [Descrição]                         │
│  Preço: R$ [________]               │
│                                      │
│  ┌─ Produto à granel ───────────┐   │
│  │ ( ) Unidades  (●) Kg         │   │
│  │                              │   │
│  │ Estoque: [__1,500__] [Kg] ▼ │   │
│  └──────────────────────────────┘   │
│                                      │
│  Estoque crítico: [____]             │
│  Estoque moderado: [____]            │
│  [Registrar]                         │
└──────────────────────────────────────┘
```

- Toggle persiste no estado `isBulk`.
- Quando `isBulk === true`:
  - Rótulo "Quantidade" muda para "Estoque (gramas)" ou similar
  - Seletor Kg/g aparece (Radio: Kg | g ou Picker)
  - Input mostra placeholder com a unidade selecionada
  - Ao salvar, converte para gramas: se Kg → `valor * 1000`, se g → `valor`
- Quando `isBulk === false`: comportamento atual (input inteiro, sem unidade).

### 6. Cliente - ProductDetail para produtos granel

```
┌──────────────────────────────────────┐
│  [Foto do produto]   [Nome]          │
│                       [Descrição]    │
│                       Estoque: 1,500 │
│                       Kg             │
│                                      │
│  Quantidade:                         │
│  (●) Kg  ( ) g                      │
│  [____1,5____]                       │
│                                      │
│  R$ 12,50 / Kg                       │
│                                      │
│  [ (+ Adicionar ao carrinho) ]      │
└──────────────────────────────────────┘
```

- Estado local: `selectedUnit: 'kg' | 'g'`, `inputValue: string`
- Conversão no `addToCart`: gramas = `selectedUnit === 'kg' ? parseFloat(inputValue) * 1000 : parseInt(inputValue, 10)`
- O carrinho recebe `quantity` em gramas (inteiro).
- Preço exibido como "R$ 12,50 / Kg" em vez de "R$ 12,50 Un."
- Alerta de estoque baixo compatível (thresholds em gramas).

### 7. Exibição no catálogo (Customer)

- `CatalogHeader` exibe cards com estoque formatado: se `isBulk`, mostra "X,XXX Kg" senão "X unidades".
- Preço: se `isBulk`, exibe "R$ XX,XX / Kg".

### 8. Arquitetura de dados

```
┌──────────────────────────────────────────────────┐
│                Supabase (products)                │
├──────────┬──────────┬───────┬─────────┬─────────┤
│  id      │  name    │ stock │ is_bulk │  price  │
├──────────┼──────────┼───────┼─────────┼─────────┤
│  uuid1   │Ração sol │ 5000  │ true    │  12.50  │  ← 5 Kg em gramas
│  uuid2   │Pacote raç│   3   │ false   │  45.00  │  ← 3 unidades
│  uuid3   │Adubo 1Kg │ 1500  │ true    │   8.90  │  ← 1,5 Kg
└──────────┴──────────┴───────┴─────────┴─────────┘
```

### 9. Utilitário de formatação

```typescript
// shared/utils/formatStock.ts
export function formatStock(stock: number, isBulk: boolean): string {
  if (isBulk) {
    const kg = stock / 1000;
    return kg.toLocaleString('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }) + ' Kg';
  }
  return `${stock} ${stock === 1 ? 'unidade' : 'unidades'}`;
}
```

## Risks / Trade-offs

- **Perda de precisão**: Gramas como inteiro significa que quantidades como 0,001 Kg (1g) são possíveis. Frações menores que 1g não são suportadas — aceitável para o domínio.
- **Produtos existentes**: Produtos com `is_bulk = false` continuam funcionando exatamente como antes. Nenhuma migração de dados necessária.
- **Estoque crítico/moderado**: Admin deve definir thresholds em gramas para produtos granel. Pode causar confusão inicial, mas o toggle deixa explícito.
- **Relatórios**: Relatórios que somam `stock` misturarão unidades e gramas. Solução: filtrar por `is_bulk` ou relatar separadamente.
