# Tarefas: Seções promocionais no catálogo do cliente

## 1. Migrações Supabase

### 1.1 Adicionar coluna discount_percentage em products
- [x] **Implementação:** Migration `48. add_discount_percentage.sql` criada

### 1.2 Criar tabela product_daily_views
- [x] **Implementação:** Migration `49. product_daily_views.sql` criada

### 1.3 Criar RPC increment_product_view
- [x] **Implementação:** Migration `50. increment_product_view_rpc.sql` criada

## 2. Admin — Toggle "Em promoção" + Campo desconto

### 2.1 Adicionar toggle "Em promoção" no formulário de edição
- [x] **Implementação:** `ProductEditScreen.tsx` — toggle "Em promoção" adicionado abaixo do info hint de estoques

### 2.2 Animação brilhante/cintilante no toggle
- [x] **Implementação:** `useProductEditScreen.ts` — `promoGlow` Animated.loop com sequência 0→1→0 a cada 600ms

### 2.3 Campo de porcentagem com fundo roxo
- [x] **Implementação:** Renderização condicional de `TextInput` com borda roxa (#9C27B0) e fundo roxo claro/escuro

### 2.4 Validação do percentual (1-100)
- [ ] **Teste:** Inserir "abc", "0", "150" e verificar erro; inserir "30" e salvar
- [ ] **Implementação:** Validação `parseInt` + range 1-100 antes de salvar

### 2.5 Salvar discount_percentage no Supabase
- [x] **Implementação:** `discount_percentage` incluído no `updateData` em `handleConfirm`
- [x] **Implementação:** `DBProduct` e `Product` entity atualizados com `discount_percentage`/`discountPercentage`

## 3. Cliente — Rastreamento de acessos

### 3.1 Chamar RPC ao abrir ProductDetail
- [ ] **Teste:** Mock `supabase.rpc` e verificar chamada com productId correto
- [ ] **Implementação:** Em `useProductDetailScreen.ts`, chamar `increment_product_view` no mount

### 3.2 Tratamento de erro (falha silenciosa)
- [ ] **Teste:** Mock erro no RPC e verificar que não quebra a tela
- [ ] **Implementação:** Try/catch ignorando erro

## 4. Cliente — Hook useHomeScreen reformulado

### 4.1 Buscar produtos em promoção
- [ ] **Teste:** Mock retorno com e sem produtos com `discount_percentage`
- [ ] **Implementação:** `fetchPromoProducts()` filtrando `discount_percentage IS NOT NULL`

### 4.2 Buscar mais acessados hoje
- [ ] **Teste:** Mock `product_daily_views` com dados do dia
- [ ] **Implementação:** `fetchMostViewedToday()` consultando tabela e top N

### 4.3 Buscar mais comprados hoje
- [ ] **Teste:** Mock query agregada de `order_items`
- [ ] **Implementação:** `fetchMostSoldToday()` consultando order_items do dia

### 4.4 Calcular produtos para cada seção (interseção com filtro)
- [ ] **Teste:** Produto com desconto e que passa no filtro de busca aparece em promoção
- [ ] **Implementação:** Aplicar `matchesSearch` e `matchesCategory` em cada lista

### 4.5 Calcular selo "Destaque Nx"
- [ ] **Teste:** Produto em 2 seções → getDestaqueCount = 2
- [ ] **Implementação:** Função que conta em quantas listas o produto aparece

### 4.6 Prioridade do selo
- [ ] **Teste:** Produto em promoção e mais acessados → selo aparece em promoção
- [ ] **Implementação:** Ao renderizar cada seção, passar `showDestaque` baseado em prioridade

### 4.7 Separar produtos restantes para grade normal
- [ ] **Teste:** Grade normal contém todos os produtos (incluindo os das seções)
- [ ] **Implementação:** `remainingProducts` = `filteredProducts` (para grade normal)

## 5. Cliente — Componente PromoCard

### 5.1 Estrutura do card
- [ ] **Teste:** Renderizar com nome, preço original, preço promocional, badge %
- [ ] **Implementação:** Novo componente `PromoCard.tsx`

### 5.2 Badge de porcentagem no canto superior esquerdo
- [ ] **Teste:** Badge com "30%" visível
- [ ] **Implementação:** View absoluta com estilo chamativo

### 5.3 Preço original cortado + preço promocional
- [ ] **Teste:** Verificar "R$ 40,00" riscado e "R$ 28,00" em destaque
- [ ] **Implementação:** `Text` com `textDecorationLine: 'line-through'` + `Text` destaque

### 5.4 Selo "Destaque Nx" no canto superior direito
- [ ] **Teste:** `showDestaque=true` → badge "Destaque 2x" visível; `false` → oculto
- [ ] **Implementação:** Renderização condicional de badge

### 5.5 Animação pulsante/brilhante
- [ ] **Teste:** Verificar `Animated.loop` rodando
- [ ] **Implementação:** `Animated.Value` loop com interpolação de opacidade/scale

### 5.6 Design "bem decorado"
- [ ] **Teste:** Renderizar e verificar estilos aplicados (borda, sombra, gradiente)
- [ ] **Implementação:** Estilos especiais no card (borderRadius, shadow, cores vibrantes)

## 6. Cliente — Seções horizontais na HomeScreen

### 6.1 Substituir FlatList por SectionList ou ScrollView aninhada
- [ ] **Teste:** Renderizar HomeScreen e verificar 4 seções
- [ ] **Implementação:** Refatorar `HomeScreen.tsx` para usar `SectionList` com 4 sections

### 6.2 Seção horizontal "Produtos em Promoção"
- [ ] **Teste:** Verificar FlatList horizontal com PromoCards
- [ ] **Implementação:** Renderizar `FlatList horizontal` com `PromoCard`

### 6.3 Seção horizontal "Mais Acessados Hoje"
- [ ] **Teste:** Verificar FlatList horizontal com ProductCards normais
- [ ] **Implementação:** Renderizar `FlatList horizontal` com `ProductCard`

### 6.4 Seção horizontal "Mais Comprados Hoje"
- [ ] **Teste:** Verificar FlatList horizontal com ProductCards normais
- [ ] **Implementação:** Renderizar `FlatList horizontal` com `ProductCard`

### 6.5 Separadores entre seções
- [ ] **Teste:** Verificar linhas com títulos entre seções
- [ ] **Implementação:** Componente `SectionSeparator` com título e linha horizontal

## 7. Cliente — Grade normal + Banner

### 7.1 Grade normal 2 colunas
- [ ] **Teste:** Renderizar grid 2 colunas com todos os produtos
- [ ] **Implementação:** FlatList 2 colunas na section 4

### 7.2 Inserir banner após 6 produtos
- [ ] **Teste:** FlatList com 10 produtos → banner na posição 6 (índice 6)
- [ ] **Implementação:** `ListHeaderComponent` não funciona para meio da lista → usar `FlatList` com dados divididos ou `renderItem` com índice condicional

### 7.3 Componente FreteBanner
- [ ] **Teste:** Renderizar com "Compras acima de R$ 30,00 não paga frete"
- [ ] **Implementação:** Novo componente `FreteBanner.tsx`

### 7.4 "Frete grátis hoje!" apenas em ter/qui/sex
- [ ] **Teste:** Mockar dia da semana e verificar visibilidade
- [ ] **Implementação:** `[2, 4, 5].includes(new Date().getDay())` — terça(2), quinta(4), sexta(5)

### 7.5 Tema claro e escuro
- [ ] **Teste:** Renderizar com `isDarkMode=true/false` e verificar estilos
- [ ] **Implementação:** Estilos condicionais via `ThemeContext`

## 8. Tratamento de erros e exceções

### 8.1 Falha ao carregar seções especiais não quebra catálogo
- [ ] **Teste:** Mock erro em `fetchPromoProducts` → seção não aparece, grade normal continua
- [ ] **Implementação:** Try/catch em cada fetch, seção vazia se erro

### 8.2 Seção vazia não renderiza
- [ ] **Teste:** Nenhum produto em promoção → seção oculta
- [ ] **Implementação:** Verificar `data.length > 0` antes de renderizar seção

## 9. Testes de integração

### 9.1 Catálogo completo renderiza sem erro
- [ ] **Teste:** Renderizar HomeScreen com mocks de todas as 4 fontes de dados
- [ ] **Verificar:** 3 seções horizontais + grade normal + banner visíveis

### 9.2 Navegação para ProductDetail
- [ ] **Teste:** Clicar "Ver Item" em PromoCard → navega para ProductDetail
- [ ] **Verificar:** Navegação com parâmetros corretos

### 9.3 Add to cart em PromoCard
- [ ] **Teste:** Clicar carrinho em PromoCard → item adicionado ao cart
- [ ] **Verificar:** CartContext.addToCart chamado
