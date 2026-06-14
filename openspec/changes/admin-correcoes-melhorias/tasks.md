# Tasks — Correções e Melhorias Admin

## Task 1: Auto-desativar Produto Estoque 0
- [x] 1.1 No `useProductCreateScreen.ts`: ao criar produto com `stock_quantity = 0`, setar `active = false`
- [x] 1.2 No `useProductEditScreen.ts`: ao salvar, se `stock_quantity = 0` → `active = false`; se `> 0` → `active = true`
- [x] 1.3 No `useManageProductsScreen.ts`: adicionar subscription real-time na tabela `products` para refletir mudanças
- [x] 1.4 No `ProductCard.tsx`: garantir que o card reflita corretamente o status ativo/inativo (já fazia)
- [x] 1.5 No `useAdminDashboardPdv.ts`: ao decrementar estoque no PDV, setar `active: newStock > 0`
- [x] 1.6 Cliente só lê produtos — nada a alterar (já filtra `.eq('active', true)`)

## Task 2: Botão X nas Barras de Pesquisa
- [x] 2.1 ~~Criar componente `SearchInput` reutilizável~~ (desnecessário — X adicionado inline em cada barra)
- [x] 2.2 X adicionado no `AdminHeader.tsx` (após TextInput, mantendo design original)
- [x] 2.3 X adicionado no `PDVSection.tsx` (após TextInput, mantendo design original)
- [x] 2.4 X adicionado no `AdminMapScreen.tsx` (após TextInput, mantendo design original)
- [x] 2.5 X adicionado no `CatalogHeader.tsx` do cliente (após TextInput, mantendo design original)
- [x] 2.6 O X limpa o campo via `onChangeText('')` / `setState('')` + callback

## Task 3: Tela de Editar Filtros (Categoria/Keywords)
- [x] 3.1 Criado diretório `CategoryManagerScreen/` com `CategoryManagerScreen.tsx`, `useCategoryManagerScreen.ts`, `styles.ts`, `index.ts`
- [x] 3.2 Cards em 2 colunas (nome | keywords) com quebra de linha nas keywords
- [x] 3.3 Keywords recolhem com seta ▼ quando não editando (toggle collapse)
- [x] 3.4 Ícone editar (✏️) abre inputs inline para editar nome e keywords, salva via supabase
- [x] 3.5 Toggle ativar/desativar (👁️) e excluir (🗑️) com confirmação
- [x] 3.6 Botão "+ Nova Categoria" com modal
- [x] 3.7 No `FilterModal.tsx`: lista de categorias substituída por botão "Gerenciar categorias" que navega via `onManageCategories`
- [x] 3.8 Adicionado `CategoryManagerScreen` no `AdminTabs.tsx` (hidden tab, mantém tabs + header visíveis)
- [x] 3.9 Adicionado `updateCategory` no `categoryService.ts`

## Task 4: Toggle Quantidade Digitável no PDV
- [x] 4.1 Adicionar estado `quantityInputMode` + `setPdvCartQty` no hook `useAdminDashboardPdv.ts`
- [x] 4.2 No `PDVSection.tsx`: adicionar interruptor ON/OFF abaixo do filtro (ícone animado + texto "Ativar digitação" + Switch)
- [x] 4.3 Quando ON: renderizar `TextInput` numérico para digitar quantidade
- [x] 4.4 Quando OFF: renderizar stepper -/+ original
- [x] 4.5 Valor é validado via `Math.max(1, qty)` e `parseInt`

## Task 5: Correção Estoque Kg/g
- [x] 5.1 `formatStock.ts` já exibe corretamente (Kg = stock/1000)
- [x] 5.2 No `PDVSection.tsx`: adicionado toggle Kg/g por bulk item (clicar no estoque alterna)
- [x] 5.3 No `useAdminDashboardPdv.ts`: checkout converte conforme unidade:
  - `kg` → qtyInGrams = qty * 1000; preço = qty * price
  - `g` → qtyInGrams = qty; preço = (qty / 1000) * price
- [x] 5.4 Checkout valida `newStock >= 0` (Math.max(0, newStock))
- [x] 5.5 Estoque já é armazenado em gramas (stock/1000 = Kg)
- [x] 5.6 Adicionado `is_bulk, is_per_meter` na query de produtos do PDV
- [x] 5.7 Toggle Kg/g por bulk item no estoque (clicável) + no input de quantidade (label + parse diferente)

## Task 6: Sangria e Suprimento em Tempo Real
- [x] 6.1 Identificado: SecureStore key `agropet_sangrias` em useAdminDashboard, useAdminConsultSales, useOrderMutations
- [x] 6.2 Criada migration `47. cash_flow_transactions.sql` + subscriptions em dashboard e consult sales
- [x] 6.3 Subscriptions adicionadas via `supabase.channel` em ambos os hooks
- [x] 6.4 Leitura/escrita migrada de SecureStore para Supabase `cash_flow` table
  - Criado `cashFlowService.ts` com `fetchCashFlow()` e `insertCashFlow()`
  - `useAdminDashboard.ts`: substituído SecureStore por `fetchCashFlow`/`insertCashFlow` + subscription
  - `useAdminConsultSales.tsx`: substituído SecureStore por `fetchCashFlow` + subscription
  - `useOrderMutations.ts`: removido dead code de matching 'Venda PDV' no SecureStore (PDV sales já estão em `orders` table)
- [x] 6.5 Tempo real garantido via `postgres_changes` subscriptions em todos os admins

## Task 7: Refresh nas Telas
- [x] 7.1 No `useManageProductsScreen.tsx`: adicionar estado `refreshing` e função `onRefresh` que recarrega produtos do Supabase
- [x] 7.2 No `ManageProductsScreen.tsx`: adicionar `RefreshControl` no FlatList com `refreshing` e `onRefresh`
- [x] 7.3 No `AdminDashboardScreen.tsx`: adicionar `RefreshControl` no ScrollView com `refreshing` e `onRefresh` (recarrega dashboard + cash flow)
- [x] 7.4 No `AdminConsultSalesScreen.tsx`: `RefreshControl` já existia no ScrollView

## Task 8: Reforma da Tela de Caixa
- [x] 8.0 Criar migration `48. cash_register_task8.sql` (bill_200, closed, auto_closed, skip_message)
- [x] 8.1 Criar `cashRegisterHours.ts` separado de `shopHours.ts`:
  - Abertura: 07:30 — 11:30 (todos os dias exceto domingo)
  - Fechamento útil (Seg–Sex): 16:00 — 23:59
  - Fechamento sáb/fer: 12:00 — 23:59
  - Domingo: inacessível
- [x] 8.2 Reformular `useCashRegister.ts` com máquina de estados (0–7):
  - States: no_opening, editing_opening, opening_done, opening_edited, editing_closing, closing_done, closed, view_past
  - Botões esquerdo/direito calculados dinamicamente
  - Ações: startOpening, confirmOpening, editOpening, startClosing, confirmClosing, editClosing, encerrar
- [x] 8.3 Redesenhar `CashRegisterScreen.tsx` com novo layout:
  - 1ª linha: [Abertura estado] [Fechamento estado]
  - 2ª linha: [Encerrar caixa (laranja)] (oculto até fechamento salvo)
  - 3ª linha: [Cancelar]
  - View mode: [Ver abertura] [Ver fechamento] [Comparar] [Voltar]
- [x] 8.4 Atualizar `useCashRegisterScreen.ts` para nova interface do hook
- [x] 8.5 Corrigir bug de "Ver abertura" / "Ver fechamento" em `CashRegisterHistoryScreen`:
  - Agrupa entradas por data, mostra status (✓/✗) para abertura e fechamento
  - Navega para CashRegisterScreen com data selecionada → view mode
- [x] 8.6 Corrigir bug de `saveEntry` com `entry_type = 'closing'`:
  - Garantir coluna `bill_200` na migration 48
  - Adicionar `closeEntry` e `markDayAsClosed` no service
  - `saveEntry` aceita `skipMessage` opcional
- [x] 8.7 Botão "Comparar" na view mode + tela de comparação existente ajustada
- [x] 8.8 Auto-registro na virada do dia:
  - Dias úteis: após 23:59 → salva fechamento automaticamente se esquecer
  - Sáb/fer: após 13:59 → salva automaticamente
  - Marca como `auto_closed = true` com mensagem explicativa
