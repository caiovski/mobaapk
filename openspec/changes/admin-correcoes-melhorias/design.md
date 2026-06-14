# Design — Correções e Melhorias Admin

## 1. Auto-desativar Produto Estoque 0

### Lógica
- **Criação**: se `stock_quantity = 0`, salvar com `active = false`
- **Atualização**: se `stock_quantity` muda para `0` → `active = false`; se muda para `> 0` → `active = true`
- **Tempo real**: usar subscription Supabase na tabela `products` no hook `useManageProductsScreen` para refletir mudanças sem refresh manual
- **Reativar**: já existe `DeactivateLowStockProductsUseCase` — estender para ativar quando > 0

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/screens/admin/ProductCreate/useProductCreateScreen.ts` | Ao salvar, se `stock_quantity = 0`, setar `active = false` |
| `agropet-admin/src/presentation/screens/admin/ProductEdit/useProductEditScreen.ts` | Ao salvar, se `stock_quantity = 0` → `active = false`; se `> 0` → `active = true` |
| `agropet-admin/src/presentation/screens/admin/ManageProducts/useManageProductsScreen.ts` | Adicionar subscription real-time na tabela products |
| `agropet-admin/src/presentation/screens/admin/ManageProducts/ProductCard.tsx` | Refletir status ativo/inativo em tempo real |
| `agropet-cliente/src/...` (telas equivalentes) | Replicar lógica no cliente |

### Campos relevantes do produto
- `stock_quantity: number`
- `unit_type: 'un' | 'kg' | 'g'`
- `active: boolean`

---

## 2. Botão X nas Barras de Pesquisa

### Comportamento
- Botão X (ícone de limpar) aparece na extremidade direita do TextInput
- **Visível apenas quando** `searchText.length > 0`
- Ao clicar: `setSearchText('')` e `onSearchChange('')`
- Estilo: ícone X dentro do input, à direita

### Onde implementar (admin)
| Arquivo | Componente |
|---------|-----------|
| `agropet-admin/src/presentation/components/AdminHeader.tsx` | Header com search |
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/components/PDVSection.tsx` | Search do PDV |
| `agropet-admin/src/presentation/screens/admin/AdminMap/AdminMapScreen.tsx` | Search do mapa |

### Onde implementar (cliente)
Todas as telas exceto boas-vindas, login e cadastro:
- `agropet-cliente/src/presentation/screens/client/Home/HomeScreen.tsx`
- `agropet-cliente/src/presentation/components/ClientHeader.tsx` (se existir)
- Demais telas com barra de pesquisa

### Implementação
Criar componente `SearchInput` reutilizável que encapsula o TextInput + botão X:

```
┌──────────────────────────────┬──┐
│  Pesquisar...                │ X│  ← X só aparece se digitando
└──────────────────────────────┴──┘
```

---

## 3. Tela de Editar Filtros (Categoria/Keywords)

### Estrutura da tela
```
┌─────────────────────────────────────────┐
│  Gerenciar Categorias                   │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Categoria A  │  │ Categoria B  │      │ ← Cards 2 colunas
│  │ keyword1     │  │ keywordX     │      │
│  │ keyword2     │  │ keywordY ▼   │      │ ← ▼ se muitas keywords
│  │              │  │              │      │
│  │ ✏️ 🗑️ 🌙    │  │ ✏️ 🗑️ 🌙    │      │ ← Editar/Excluir/Ativar
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Categoria C  │  │             │      │
│  │              │  │             │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  [+ Nova Categoria]                     │
└─────────────────────────────────────────┘
```

### Funcionalidades
- **Card 2 colunas**: nome da categoria (esquerda), keywords (direita)
- **Keywords**: quebram linha livremente se muitas; quando não editando, recolhem com seta ▼ para altura do nome
- **Editar**: ícone ✏️, abre modal inline para editar nome e keywords (igual ao padrão de Editar Produto)
- **Ativar/Desativar**: ícone 🌙 (toggle visual)
- **Excluir**: ícone 🗑️ com confirmação
- **Botão "Gerenciar Categorias"** no `FilterModal.tsx` substitui a lista atual de categorias — leva para esta tela

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/screens/admin/ManageProducts/FilterModal.tsx` | Botão "Gerenciar categorias" navega para nova tela |
| Nova tela: `agropet-admin/src/presentation/screens/admin/ManageProducts/CategoryManagerScreen/` | Tela completa |
| `agropet-admin/src/services/categoryService.ts` | Se necessário, adicionar updateCategory |

---

## 4. Toggle Quantidade Digitável no PDV

### Layout na tela Registrar Venda
```
┌──────────────────────────────────────┐
│  Produto XPTO            R$ 25,90    │
│                                      │
│  Quantidade                          │
│  ┌────────────────────────────────┐  │
│  │ ON [Modo digitável]            │  │ ← Interruptor
│  └────────────────────────────────┘  │
│                                      │
│  ┌─ Se ON ───────────────────────┐  │
│  │  [       Digite a qtd    ]    │  │ ← TextInput numérico
│  └───────────────────────────────┘  │
│                                      │
│  ┌─ Se OFF ──────────────────────┐  │
│  │  [-] 2 [+]                     │  │ ← Stepper original
│  └───────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/components/PDVSection.tsx` | Adicionar toggle + modo digitável |
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/useAdminDashboardPdv.ts` | Estado `quantityInputMode` |

---

## 5. Correção Estoque Kg/g

### Problema atual
`formatStock.ts` trata `stock_quantity` como valor inteiro. Produto com `1,500 Kg` (1500 gramas) aparece como `1500 unidades`. Quando admin vende "2 unidades", desconta 2 de 1500 → `1498`.

### Solução
- Produtos com `unit_type = 'kg'` ou `'g'` passam a ter **dois campos separados** no PDV:
  - Seletor **Kg**: descontos em quilos (1, 2, 3...) — converte para gramas internamente
  - Seletor **g**: descontos em gramas (100, 200, 500...)
- **Cálculo**: estoque é armazenado em gramas no backend. `stock_quantity` é sempre em gramas.
  - `1,500 Kg` = `1500` gramas no banco
  - Admin escolhe Kg → digita `1` → desconta `1000` gramas → estoque vira `500`g (0,500 Kg)
  - Admin escolhe g → digita `500` → desconta `500` gramas → estoque vira `1000`g (1,000 Kg)

### Onde alterar
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/utils/formatStock.ts` | Formatar estoque em Kg/g corretamente |
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/components/PDVSection.tsx` | Adicionar seletores Kg/g no item do PDV |
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/useAdminDashboardPdv.ts` | Lógica de desconto em gramas |
| `agropet-admin/src/domain/use-cases/ProcessPDVCheckoutUseCase.ts` | Validar e processar desconto em gramas |

---

## 6. Sangria em Tempo Real

### Problema atual
Sangria e suprimento são salvos em `SecureStore` local (`agropet_sangrias`). Não há sincronização entre dispositivos — ambos compartilham o mesmo problema.

### Solução
Migrar sangria E suprimento para uma tabela no Supabase e usar subscription real-time:

1. Criar/subscription na tabela `cash_flow_transactions` (ou tabela existente de fluxo de caixa)
2. Remover dependência de `SecureStore` para leitura de sangrias e suprimentos
3. Usar `supabase.channel('cash-flow').on('postgres_changes', ...)` para atualizar em tempo real
4. Hook `useCashRegister` ou hook dedicado escuta as mudanças de ambos os tipos

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/contexts/useCashRegister.ts` | Subscription real-time para sangria + suprimento |
| `agropet-admin/src/presentation/screens/admin/AdminDashboard/useAdminDashboardPdv.ts` | Substituir SecureStore por Supabase para ambos |
| `agropet-admin/src/services/cashRegisterService.ts` | Adicionar métodos para sangria e suprimento |

---

## 7. Reforma da Tela de Caixa

### Novos Horários
| Dia | Abertura | Fechamento |
|-----|----------|------------|
| Segunda a Sexta | 07:30 — 11:30 | 16:00 |
| Sábados e Feriados | 07:30 — 11:30 | 23:59 |

### Layout da Tela Principal
```
┌──────────────────────────────────────────┐
│  Abertura / Fechamento do Caixa   [📅]   │
├──────────────────────────────────────────┤
│  ┌─ Cédulas ──────────────────────────┐  │
│  │  (DenominationRows)                │  │
│  └────────────────────────────────────┘  │
│  ┌─ Moedas ───────────────────────────┐  │
│  │  (DenominationRows)                │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ── Estado: Nenhuma abertura ──         │
│  [Confirmar abertura] [Fechar Caixa]    │
│           [Cancelar]                     │
│                                          │
│  ── Estado: Abertura confirmada ──      │
│  [Editar abertura] [Fechar] (cinza)    │
│           [Cancelar]                     │
│                                          │
│  ── Estado: Fechamento disponível ──    │
│  [Editar abertura] [Fechar Caixa]       │
│           [Cancelar]                     │
│                                          │
│  ── Ver registro (tela de histórico) ── │
│  [Ver abertura] [Ver fechamento]        │
│           [Comparar]                     │ ← Novo botão
└──────────────────────────────────────────┘
```

### Regras de Botões
| Botão | Visível quando | Cor | Ação |
|-------|---------------|-----|------|
| Confirmar abertura | Sem abertura hoje, dentro do horário | Verde `#339914` | Salvar abertura |
| Editar abertura | Após confirmar (1 uso apenas) | Verde água | Reabrir steppers |
| Fechar Caixa | Após abertura, dentro do horário de fechamento | Vermelho `#A72424` | Abrir formulário de fechamento |
| Fechar (cinza) | Após abertura, FORA do horário de fechamento | Cinza | Desabilitado |
| Cancelar | Sempre | Outline cinza | Voltar ao Dashboard |
| Ver abertura | Dia com registro | Azul `#2D8CE5` | Exibir valores |
| Ver fechamento | Dia com registro | Azul `#2D8CE5` | Exibir valores |
| Comparar | Dia com abertura + fechamento | Outline | Comparar valores |

### Correção de Bugs
- **"Ver" não clicável**: corrigir handler de navegação em `CashRegisterHistoryScreen`
- **Fechamento não registra**: corrigir `saveEntry` para `entry_type = 'closing'` — verificar validação de dados

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/screens/admin/CashRegister/CashRegisterScreen/CashRegisterScreen.tsx` | Novo layout, botões, estados |
| `agropet-admin/src/presentation/screens/admin/CashRegister/CashRegisterScreen/useCashRegisterScreen.ts` | Nova lógica de horários, edição única |
| `agropet-admin/src/presentation/screens/admin/CashRegister/CashRegisterScreen/styles.ts` | Novos estilos |
| `agropet-admin/src/presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/CashRegisterHistoryScreen.tsx` | Corrigir "Ver" |
| `agropet-admin/src/presentation/screens/admin/CashRegister/CashRegisterHistoryScreen/useCashRegisterHistoryScreen.ts` | Handler de navegação |
| `agropet-admin/src/utils/shopHours.ts` | Atualizar constantes de horário |

---

## 8. Refresh na Tela Gerenciar Produtos

Adicionar `RefreshControl` (pull-to-refresh) no `FlatList` da `ManageProductsScreen`, seguindo o mesmo padrão já implementado em `AdminConsultSalesScreen`.

### Implementação
- No `useManageProductsScreen.ts`: adicionar estado `refreshing` e função `onRefresh` que refetch os produtos
- No `ManageProductsScreen.tsx`: adicionar `refreshControl` prop no `FlatList`
- O refresh deve recarregar a lista de produtos do Supabase e reaplicar os filtros ativos

### Arquivos afetados
| Arquivo | Mudança |
|---------|---------|
| `agropet-admin/src/presentation/screens/admin/ManageProducts/useManageProductsScreen.tsx` | Adicionar `refreshing` + `onRefresh` |
| `agropet-admin/src/presentation/screens/admin/ManageProducts/ManageProductsScreen.tsx` | Adicionar `RefreshControl` no FlatList |

---

## 9. Restrições Técnicas
- **Não alterar**: app.json, app.config.js, eas.json, package.json
- **Novas dependências**: nenhuma (só código existente)
- **Supabase real-time**: usar `supabase.channel()` já disponível no projeto
- **Arquitetura**: seguir padrão de diretório por tela (Screen + useScreen + styles) já estabelecido
- **File size**: manter < 250 linhas por arquivo (se exceder, refatorar)
