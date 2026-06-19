# Design: Seções promocionais no catálogo do cliente

## Arquitetura da Tela (HomeScreen)

```
HomeScreen
├── CatalogHeader (busca + avatar)
├── CatalogFilter (tags de categoria)
├── SectionList (ou ScrollView com sections)
│   ├── Section 1: "Produtos em Promoção"
│   │   └── FlatList horizontal → PromoCard
│   ├── Separator
│   ├── Section 2: "Produtos Mais Acessados Hoje"
│   │   └── FlatList horizontal → ProductCard
│   ├── Separator
│   ├── Section 3: "Produtos Mais Comprados Hoje"
│   │   └── FlatList horizontal → ProductCard
│   ├── Separator
│   └── Section 4: "Grade normal"
│       └── FlatList 2 colunas com banner
│           ├── fileira 1-3 (6 produtos)
│           ├── FreteBanner
│           └── produtos restantes
└── Greeting bar (existente)
```

## Fluxo de Dados

```
useHomeScreen.ts
├── fetchProducts()             → Supabase products (existente)
├── fetchPromoProducts()        → products WHERE discount_percentage IS NOT NULL
├── fetchMostViewedToday()      → product_daily_views WHERE date = today
├── fetchMostSoldToday()        → order_items agregado por produto hoje
│
├── filteredProducts            → filtro client-side (search + category)
├── promoProducts               → filteredProducts ∩ tem discount_percentage
├── mostViewedProducts          → filteredProducts ∩ top N mais vistos hoje
├── mostSoldProducts            → filteredProducts ∩ top N mais vendidos hoje
│
└── SectionList data:
    [{ title: 'promocao', data: [promoProducts] },
     { title: 'mais_acessados', data: [mostViewedProducts] },
     { title: 'mais_comprados', data: [mostSoldProducts] },
     { title: 'catalogo', data: [remainingProducts] }]
```

### Cálculo do selo "Destaque Nx"

```
function getDestaqueCount(productId):
  count = 0
  if productId in promoProducts     → count++
  if productId in mostViewedProducts → count++
  if productId in mostSoldProducts  → count++
  return count  // 1, 2 ou 3
```

### Prioridade do selo

O selo aparece apenas **na seção de maior prioridade** onde o produto aparece:

1. Promoção (maior prioridade)
2. Mais acessados
3. Mais comprados

## Componentes

### 1. PromoCard (novo)

```
┌──────────────────┐
│ ╔══════╗  ┌────┐ │
│ ║ 30%  ║  │⭐  │ │
│ ╚══════╝  │DEST│ │
│           │ 2x │ │
│    [IMAGEM]    │ │
│                │ │
│  Nome do Prod  │ │
│  R$ 40,00      │ │
│  R$ 28,00      │ │
│          [🛒]  │ │
└──────────────────┘
```

- Animação: pulsar opacidade + brilho (Animated.loop)
- Badge "%" no canto superior esquerdo (estilo chamativo)
- Selo "Destaque Nx" no canto superior direito (condicional)
- Preço original: `textDecorationLine: 'line-through'`, cor cinza
- Preço promocional: cor destaque, fonte maior
- Fundo: gradiente sutil ou cor especial com sombra

### 2. ProductCardHorizontal (reutilizado)
- Mesmo design do card atual, adaptado para lista horizontal
- Usado em "Mais Acessados" e "Mais Comprados"

### 3. FreteBanner (novo)

```
╔══════════════════════════════════════════╗
║  🎉 Compras acima de R$ 30,00          ║
║     não paga frete!                     ║
║                                         ║
║  🚚 Frete grátis hoje! (ter/qui/sex)    ║
╚══════════════════════════════════════════╝
```

- Renderizado como item na FlatList da grade normal (após índice 6)
- Tema claro: fundo claro com borda colorida
- Tema escuro: fundo escuro com borda neon
- "Frete grátis hoje!" visível apenas em Terça, Quinta, Sexta (`new Date().getDay()`)

### 4. TogglePromocao + CampoDesconto (admin)

```
Editar Produto:
  ...
  [Toggle] Estoque Crítico (Alerta Vermelho)
  [Toggle] Estoque Moderado (Alerta Amarelo)
  [Toggle ✨] Em promoção  ← brilhante/cintilante
  ┌──────────────────────────────┐
  │ ✨ Porcentagem do desconto   │ ← fundo roxo brilhante
  │ [ 30 ]                       │
  └──────────────────────────────┘
```

## Banco de Dados

### Nova coluna em `products`
```sql
ALTER TABLE products ADD COLUMN discount_percentage INTEGER DEFAULT NULL;
```

### Nova tabela `product_daily_views`
```sql
CREATE TABLE product_daily_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 1,
  UNIQUE(product_id, date)
);
```

### Consulta "mais comprados hoje"
```sql
SELECT oi.product_id, SUM(oi.quantity) as total_sold
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'completed'
  AND o.created_at >= CURRENT_DATE
GROUP BY oi.product_id
ORDER BY total_sold DESC
LIMIT 10;
```

## Rastreamento de Acessos

No `useHomeScreen.ts`, quando um produto é visível ou quando o usuário clica em "Ver Item":

```typescript
// Em ProductDetail, ao abrir:
const trackView = async (productId: string) => {
  await supabase.rpc('increment_product_view', { p_product_id: productId });
};
```

Função RPC `increment_product_view`:
```sql
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO product_daily_views (product_id, date, views)
  VALUES (p_product_id, CURRENT_DATE, 1)
  ON CONFLICT (product_id, date)
  DO UPDATE SET views = product_daily_views.views + 1;
END;
$$ LANGUAGE plpgsql;
```

## Navegação

- "Ver Item" nos cards → `ProductDetailScreen` (existente)
- Add to cart → `CartContext.addToCart` (existente)
- Nenhuma nova rota necessária

## Temas

- `FreteBanner`: duas versões de estilo (light/dark) via `ThemeContext`
- `PromoCard`: animação nativa independente de tema
- Campo de desconto no admin: fundo roxo brilhante em ambos os temas

## Tratamento de Erros

| Operação | Efeito |
|---|---|
| Falha ao buscar promoções | Seção não exibida, catálogo normal continua |
| Falha ao buscar mais acessados | Seção não exibida |
| Falha ao buscar mais comprados | Seção não exibida |
| discount_percentage inválido (<=0 ou >100) | Admin não salva, exibe erro |
| RPC de view falha | Ignorado (apenas log) |
