## 1. Banco de Dados e Migração

- [x] 1.1 Criar migration `44. is_bulk.sql` com `ALTER TABLE products ADD COLUMN is_bulk BOOLEAN NOT NULL DEFAULT false` + índice opcional.
- [ ] 1.2 Criar migration `45. bulk_stock_check.sql` com validação (opcional): estoque de produtos granel deve ser múltiplo de 1g (sempre inteiro).

## 2. Utilitário de Formatação Compartilhado

- [x] 2.1 Escrever teste para `formatStock(stock, isBulk)`: gramas → "X,XXX Kg", unidades → "X unidades", singular, zero.
- [x] 2.2 Implementar `formatStock` em `agropet-admin/src/utils/formatStock.ts` e `agropet-cliente/src/utils/formatStock.ts`.

## 3. Admin - Schema + Types

- [x] 3.1 Adicionar `is_bulk?: boolean` à interface `DBProduct` em `agropet-admin/src/db/schema.ts`.
- [x] 3.2 Adicionar `is_bulk?: boolean` à interface `DBProduct` em `agropet-cliente/src/db/schema.ts`.

## 4. Admin - ProductCreate (Registrar)

- [x] 4.1 Escrever teste para `useProductCreateScreen` com `isBulk=true`: toggle exibido, seletor Kg/g visível, conversão para gramas no payload de insert.
- [x] 4.2 Adicionar estado `isBulk`, `selectedUnit`, `inputValue` no `useProductCreateScreen`.
- [x] 4.3 Adicionar toggle "Produto à granel" (Switch) no formulário, entre preço e estoque.
- [x] 4.4 Adicionar seletor Kg/g (Radio ou Picker) e input no campo estoque, condicionais a `isBulk`.
- [x] 4.5 Atualizar `handleRegister` para converter `inputValue` para gramas no payload (`stock`) conforme `selectedUnit` e `isBulk`.
- [x] 4.6 Escrever teste para `ProductCreateScreen` renderizando toggle e seletor, e simulando registro com/sem granel.

## 5. Admin - ProductEdit

- [x] 5.1 Escrever teste para `useProductEditScreen` com `isBulk=true`: carregar valor em gramas, exibir em Kg, converter de volta ao salvar.
- [x] 5.2 Adicionar estado `isBulk`, `selectedUnit`, `inputValue` no `useProductEditScreen`, inicializando a partir do `product.is_bulk`.
- [x] 5.3 Adicionar toggle "Produto à granel" e seletor Kg/g no formulário de edição.
- [x] 5.4 Atualizar `handleConfirm` para converter valor de Kg/g para gramas no update.
- [x] 5.5 Escrever teste para `ProductEditScreen` com produto granel: exibição correta e salvamento.

## 6. Admin - ProductCard (Listagem)

- [x] 6.1 Escrever teste para `ProductCard` com `item.is_bulk=true`: exibir "X,XXX Kg", alertas de estoque com thresholds em gramas.
- [x] 6.2 Atualizar `ProductCard` para usar `formatStock` quando `item.is_bulk` for true.
- [x] 6.3 Ajustar cores de alerta (critical/moderate) para funcionar com gramas (thresholds permanecem em gramas).

## 7. Admin - PDVSection

- [x] 7.1 Escrever teste para PDVSection com produto granel: exibir estoque em Kg, input de quantidade com seletor Kg/g.
- [x] 7.2 Atualizar exibição de estoque para usar `formatStock` quando `isBulk`.
- [ ] 7.3 Adicionar seletor Kg/g no input de quantidade para produtos granel.
- [ ] 7.4 Converter quantidade para gramas ao confirmar venda.

## 8. Cliente - Schema (SQLite)

- [x] 8.1 Nenhuma mudança necessária no SQLite — `quantity INTEGER NOT NULL` já aceita gramas.
- [ ] 8.2 Verificar teste de integração do carrinho: adicionar produto granel com 1500g, confirmar quantity = 1500.

## 9. Cliente - ProductDetail

- [ ] 9.1 Escrever teste para `useProductDetailScreen` com `product.is_bulk=true`: exibir estoque em Kg, input decimal, seletor Kg/g, conversão gramas no addToCart.
- [x] 9.2 Atualizar `useProductDetailScreen` para detectar `product.is_bulk` e gerenciar `selectedUnit`, `inputValue` decimal.
- [x] 9.3 Adicionar seletor Kg/g (Radio) e input decimal no `ProductDetailScreen`, condicional a `isBulk`.
- [x] 9.4 Exibir "Estoque: X,XXX Kg" em vez de "Estoque: X unidades" quando `isBulk`.
- [x] 9.5 Exibir alerta de estoque baixo com thresholds em gramas para granel.
- [x] 9.6 Exibir preço como "R$ XX,XX / Kg" em vez de "R$ XX,XX Un." quando `isBulk`.
- [x] 9.7 Atualizar `handleAddToCart` para converter input para gramas antes de chamar `addToCart`.
- [ ] 9.8 Escrever teste para `ProductDetailScreen` com produto granel: renderização, input, addToCart com gramas.

## 10. Cliente - Catálogo (CatalogHeader / HomeScreen)

- [ ] 10.1 Escrever teste para exibição de estoque formatado no card do catálogo quando `isBulk`.
- [x] 10.2 Atualizar exibição de estoque e preço nos cards do catálogo para usar `formatStock` e exibir "/ Kg".

## 11. Integração e Testes Finais

- [ ] 11.1 Rodar migration em ambiente de teste e verificar coluna `is_bulk`.
- [x] 11.2 Rodar suite completa de testes (admin + cliente) e garantir 100% de aprovação.
- [x] 11.3 Verificar cobertura dos novos componentes, hooks e utilitários (mínimo 100% Stmts, Branch, Funcs, Lines).
- [ ] 11.4 Teste manual: criar produto granel, editar, ver na listagem, ver no catálogo, adicionar ao carrinho, finalizar pedido, cancelar pedido (restore stock).
