# Proposta: Seções promocionais no catálogo do cliente

## Resumo

Adicionar 3 seções horizontais no topo do catálogo do app cliente: **Produtos em Promoção**, **Produtos Mais Acessados Hoje** e **Produtos Mais Comprados Hoje**. A seção de Promoção terá cards brilhantes e decorados com badge de desconto. Após as 3 seções especiais, o catálogo normal continua em grid 2 colunas. Um banner promocional de frete é inserido após 6 produtos da seção normal.

No app admin, a tela de **Editar Produto** ganha um toggle "Em promoção" com campo de porcentagem de desconto.

## Funcionalidades

### 1. Catálogo do Cliente — 3 Seções Horizontais

```
┌─────────────────────────────────────────────────┐
│  ─── Produtos em Promoção ────────────────── ►  │
│  [cards brilhantes + badge % + preço cortado]    │
│  scroll horizontal                               │
│  ─────────────────────────────────────────────  │
│                                                   │
│  ─── Mais Acessados Hoje ──────────────────── ►  │
│  [cards normais] scroll horizontal                │
│  ─────────────────────────────────────────────  │
│                                                   │
│  ─── Mais Comprados Hoje ──────────────────── ►  │
│  [cards normais] scroll horizontal                │
│  ─────────────────────────────────────────────  │
│                                                   │
│  ─── [grade normal 2 colunas] ───────────────  │
│  [produto] [produto]                              │
│  [produto] [produto]                              │
│  [produto] [produto]                              │
│                                                   │
│  ═══ BANNER FRETE GRÁTIS ═══                     │
│                                                   │
│  [produto] [produto] ...continua                  │
└─────────────────────────────────────────────────┘
```

#### Seção "Produtos em Promoção"
- Cards com **animação pulsante/brilhante**
- **Badge de porcentagem** no canto superior esquerdo (ex: "30%")
- **Preço original cortado** + preço com desconto
- Visual decorado e "impecável"

#### Seção "Produtos Mais Acessados Hoje"
- Cards com mesmo design do catálogo normal
- Scroll horizontal
- Dados de uma nova tabela `product_daily_views`

#### Seção "Produtos Mais Comprados Hoje"
- Cards com mesmo design do catálogo normal
- Scroll horizontal
- Dados agregados de `order_items` do dia atual

#### Selo "Destaque Nx"
- Se um produto aparece em múltiplas seções, exibe badge "Destaque 2x" ou "Destaque 3x"
- Prioridade do selo: Promoção > Mais acessados > Mais comprados
- Aparece apenas na seção de maior prioridade

#### Grade normal do catálogo
- Todos os produtos (incluindo os das seções especiais)
- Grid 2 colunas, scroll vertical
- Banner de frete aparece após 6 produtos (3 fileiras)

### 2. Banner de Frete Grátis

- Aparece após 6 produtos da grade normal
- Texto: "Compras acima de R$ 30,00 não paga frete"
- Segunda linha: "Frete grátis hoje!" — exibido apenas em **terça, quinta e sexta**
- Duas versões de design: tema claro e tema escuro
- Visual bem decorado

### 3. Admin — Toggle "Em promoção" + Campo de desconto

Na tela de **Editar Produto** (`agropet-admin`):
- Abaixo de "Estoque Crítico" e "Estoque Moderado", adicionar **toggle (bolinha)** "Em promoção"
- Este toggle é o **único com animação brilhante e cintilante** para chamar atenção
- Quando ativado, exibe campo com **fundo roxo brilhante** e label "Porcentagem do desconto"
- Admin digita um número inteiro (ex: 30)
- O percentual é salvo em um novo campo `discount_percentage` na tabela `products`
- Preço promocional = `preco - (preco * discount_percentage / 100)`

### 4. Novas Tabelas no Supabase

- `product_daily_views`: produto_id, data, contagem de visualizações
- `product_daily_sales`: produto_id, data, quantidade vendida (pode ser view agregada de `order_items`)

## Integrações com Supabase

- Nova tabela `product_daily_views` com RLS
- Consulta agregada em `order_items` para "mais comprados hoje"
- Migração: adicionar coluna `discount_percentage` (INTEGER, nullable) na tabela `products`

## Não Escopo

- Não serão alterados layouts de outras telas do cliente
- Não haverá notificação push de promoção
- Não haverá agendamento de promoções (apenas ativação manual)
- O rastreamento de acessos será apenas incremental (sem analytics avançado)
