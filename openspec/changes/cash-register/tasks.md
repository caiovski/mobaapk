# Tasks — Abertura/Fechamento do Caixa

## Task 1: Migração + camada de dados
- [x] 1.1 Criar migration `43. cash_register_entries.sql` com tabela, índices, RLS, gen_code function
- [x] 1.2 Adicionar `DBCashRegisterEntry` em `agropet-admin/src/db/schema.ts`
- [x] 1.3 Criar `agropet-admin/src/services/cashRegisterService.ts` com:
  - `fetchByDate(date)` → busca abertura + fechamento do dia
  - `fetchHistory()` → listagem
  - `saveEntry(entryType, date, denominations)` → insert com geração de code
  - `updateEntry(id, denominations)` → update com flag edited
  - `calculateTotal`, `calculateBillsTotal`, `calculateCoinsTotal`
- [x] 1.4 Criar `agropet-admin/src/presentation/contexts/useCashRegister.ts` hook

## Task 2: Componente DenominationRow
- [x] 2.1 Criar `DenominationRow` (label, stepper, valor calculado)
- [x] 2.2 Modo edição (steppers visíveis) vs modo leitura
- [ ] 2.3 Testes unitários

## Task 3: Tela principal CashRegisterScreen
- [x] 3.1 Criar `CashRegisterScreen.tsx` + `useCashRegisterScreen.ts` + `styles.ts`
- [x] 3.2 Filtro de data única no topo (reaproveitar DatePicker existente)
- [x] 3.3 Botão "Ver registro" ao lado do filtro → navega para histórico
- [x] 3.4 Renderizar 6 DenominationRows de cédulas + 5 de moedas
- [x] 3.5 Totais parciais (cédulas, moedas) + total global
- [x] 3.6 Lógica de abertura/fechamento:
  - Sem registro hoje → steppers ligados, botão "Confirmar abertura"
  - Abertura confirmada → steppers desligados, "Editar abertura" (verde água, 1x)
  - 17:00–20:00 → "Fechar caixa" visível (vermelho)
  - Fechamento confirmado → "Editar fechamento" (verde água, 1x)
- [x] 3.7 Dias passados: modo somente leitura + "Ver abertura"/"Ver fechamento"
- [ ] 3.8 Testes (unitários + integração)

## Task 4: Tela de histórico CashRegisterHistoryScreen
- [x] 4.1 Criar `CashRegisterHistoryScreen` com FlatList de cards
- [x] 4.2 Card exibe código, data formatada, botão "Ver"
- [x] 4.3 Clicar em "Ver" navega para CashRegisterScreen com data pré-selecionada
- [ ] 4.4 Testes

## Task 5: Botão no DashboardOverview
- [x] 5.1 Adicionar prop `onOpenCashRegister` em `DashboardOverview`
- [x] 5.2 Renderizar botão "Abertura/Fechamento do caixa" (#339914) antes de "Ver Vendas"
- [x] 5.3 Passar callback de `AdminDashboardScreen` (navigation.navigate)
- [x] 5.4 Adicionar `CashRegisterScreen` + `CashRegisterHistoryScreen` no `AdminStack`
- [ ] 5.5 Testes

## Task 6: Integração final
- [ ] 6.1 Verificar lint + typecheck
- [ ] 6.2 100% coverage nos novos componentes
