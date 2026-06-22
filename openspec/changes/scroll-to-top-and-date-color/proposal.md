# Proposta: Botão Voltar ao Topo + Cor do Campo de Data (Admin)

## Resumo

Adicionar um botão flutuante "voltar ao topo" (bolinha com setinha para cima) em 5 telas de alto giro no app, e ajustar a cor do campo de seleção de data na tela de Editar Produto (admin) para roxo, igual ao campo de desconto.

## Funcionalidades

### 1. Botão Voltar ao Topo (5 telas)

Um botão circular flutuante com ícone de seta para cima, centralizado horizontalmente, posicionado um pouco acima do final da tela. O botão:

- Fica **invisível/oculto** quando o usuário está no topo da tela
- **Aparece com animação suave** quando o usuário rola para baixo (threshold ~500px do topo)
- Ao ser pressionado, **rola suavemente** para o início da tela (topo)
- Usa `useRef` + `scrollTo` (para ScrollView) ou `scrollToOffset` (para FlatList)

#### Telas que recebem o botão

| App | Tela | Caminho do Arquivo | Container de Scroll |
|---|---|---|---|
| Cliente | Catálogo (Home) | `src/presentation/screens/client/Home/HomeScreen.tsx` | ScrollView |
| Admin | Gerenciar Produtos | `src/presentation/screens/admin/ManageProducts/ManageProductsScreen.tsx` | FlatList |
| Admin | Registrar Venda | `src/presentation/screens/admin/CashRegister/CashRegisterScreen/CashRegisterScreen.tsx` | ScrollView |
| Admin | Ver Vendas | `src/presentation/screens/admin/AdminConsultSales/AdminConsultSalesScreen.tsx` | ScrollView |
| Admin | Histórico de Vendas | `src/presentation/screens/admin/AdminSalesHistory/AdminSalesHistoryScreen.tsx` | ScrollView |

### 2. Cor do Campo de Data (Editar Produto — Admin)

Na tela de **Editar Produto** (`ProductEditScreen.tsx`), quando o toggle "Em promoção" está ativo, o campo de seleção de data (período da promoção) atualmente usa cores alaranjadas/laranja-escuras no tema escuro. O campo deve passar a usar o mesmo esquema de cores roxas do campo de desconto:

- **Borda:** `#9C27B0` (claro e escuro)
- **Fundo dark mode:** `#2C1D3D` (igual ao campo de desconto)
- **Ícone e texto:** `#9C27B0` (em vez de `#FF9800` no dark mode)

## Não Escopo

- Não serão modificados outros aspectos de layout ou funcionalidade das telas
- O botão voltar ao topo não será adicionado em telas que não as 5 listadas
- Não serão alterados modais de data/hora
