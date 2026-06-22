# Tarefas: Botão Voltar ao Topo + Cor do Campo de Data (Admin)

## 1. Componente ScrollToTopButton

### 1.1 Criar componente reutilizável
- [ ] **Implementação:** Criar `src/presentation/components/ScrollToTopButton.tsx` no agropet-admin e no agropet-cliente
  - Props: `scrollRef`, `isFlatList?`, `visibleThreshold?`
  - State: `visible` (boolean) controlado por `onScroll`
  - Render: botão circular com Feather `chevron-up`, posicionado `absolute` + `bottom: 100` + `alignSelf: center`
  - Animação: fade in/out (Animated.Value para opacidade)
  - Ao pressionar: `scrollRef.current?.scrollTo({ y: 0, animated: true })` ou `scrollToOffset({ offset: 0 })`

### 1.2 Testes do componente
- [ ] **Teste:** Renderizar com ref mockada e verificar layout
- [ ] **Teste:** Verificar que o botão está invisível quando `visible` é false
- [ ] **Teste:** Verificar que o botão fica visível quando `visible` é true
- [ ] **Teste:** Verificar que `scrollTo` é chamado ao pressionar o botão

## 2. Cliente — HomeScreen (Catálogo)

### 2.1 Adicionar scrollRef + onScroll
- [ ] **Implementação:** Adicionar `useRef<ScrollView>(null)` e `onScroll` com `Animated.event` no ScrollView da HomeScreen
- [ ] **Teste:** Simular scroll e verificar que o botão aparece/desaparece

### 2.2 Adicionar ScrollToTopButton
- [ ] **Implementação:** Renderizar `<ScrollToTopButton>` no final do JSX da HomeScreen
- [ ] **Teste:** Renderizar a tela e verificar que o botão está presente (mas oculto no topo)

## 3. Admin — Gerenciar Produtos

### 3.1 Adicionar scrollRef + onScroll no FlatList
- [ ] **Implementação:** Adicionar `useRef<FlatList>(null)` e `onScroll` no FlatList da ManageProductsScreen
- [ ] **Teste:** Simular scroll e verificar visibilidade

### 3.2 Adicionar ScrollToTopButton
- [ ] **Implementação:** Renderizar `<ScrollToTopButton isFlatList>` no JSX da ManageProductsScreen
- [ ] **Teste:** Renderizar a tela e verificar botão presente

## 4. Admin — Registrar Venda

### 4.1 Adicionar scrollRef + onScroll
- [ ] **Implementação:** Adicionar `useRef<ScrollView>(null)` e `onScroll` no CashRegisterScreen
- [ ] **Teste:** Simular scroll e verificar visibilidade

### 4.2 Adicionar ScrollToTopButton
- [ ] **Implementação:** Renderizar `<ScrollToTopButton>` no JSX
- [ ] **Teste:** Verificar botão presente

## 5. Admin — Ver Vendas

### 5.1 Adicionar scrollRef + onScroll
- [ ] **Implementação:** Adicionar `useRef<ScrollView>(null)` e `onScroll` no AdminConsultSalesScreen
- [ ] **Teste:** Simular scroll e verificar visibilidade

### 5.2 Adicionar ScrollToTopButton
- [ ] **Implementação:** Renderizar `<ScrollToTopButton>` no JSX
- [ ] **Teste:** Verificar botão presente

## 6. Admin — Histórico de Vendas

### 6.1 Adicionar scrollRef + onScroll
- [ ] **Implementação:** Adicionar `useRef<ScrollView>(null)` e `onScroll` no AdminSalesHistoryScreen
- [ ] **Teste:** Simular scroll e verificar visibilidade

### 6.2 Adicionar ScrollToTopButton
- [ ] **Implementação:** Renderizar `<ScrollToTopButton>` no JSX
- [ ] **Teste:** Verificar botão presente

## 7. Admin — Cor do Campo de Data (Editar Produto)

### 7.1 Alterar cores do campo de data para roxo
- [ ] **Implementação:** Em `ProductEditScreen.tsx` (linhas 315-326), substituir:
  - `borderColor`: de `h.isDarkMode ? '#4A4A54' : '#9C27B0'` para `'#9C27B0'`
  - `backgroundColor` dark mode: de `'#2C2C36'` para `'#2C1D3D'`
  - Icon color: de `h.isDarkMode ? '#FF9800' : '#9C27B0'` para `'#9C27B0'`
  - Text color (com data): de `h.isDarkMode ? '#FF9800' : '#9C27B0'` para `'#9C27B0'`
  - Text placeholder: de `h.isDarkMode ? 'rgba(255,152,0,0.5)' : 'rgba(156,39,176,0.5)'` para `'rgba(156,39,176,0.5)'`
- [ ] **Teste:** Renderizar ProductEditScreen em modo escuro e verificar cores roxas no campo de data
